---
name: sync-ai-map
description: Syncs .ai-kit/*.kit.md contract files against the live Figma library and ui-kit TypeScript types. Detects new/removed variant values and properties, updates the contract where safe, and produces a drift report. Use this skill whenever the user says "обнови ai-map", "Figma изменился", "проверь маппинг", "sync the kit", "check component drift", "update the contract", or any time a ui-kit component's Figma design or TypeScript types may have changed.
---

# sync-ai-map

Keeps `.ai-kit/*.kit.md` in sync with the Figma library and ui-kit TypeScript types.

## The rule that outranks every step below

**Do not state a fact about this repo that a command in this skill did not print.**
Not "the contract matches", not "still a shim", not a count of components checked.
Offline facts come from `kit-audit.mjs`; Figma facts come from `get_design_context`.
If neither produced it, it does not belong in the report.

A report is worthless when a real run and a skipped run look identical. Write
"not checked" over a plausible ✓ — a wrong ✓ is worse than a gap, because it
retires the question instead of leaving it open.

**If the user disputes a finding, re-run the command and quote its output.** Do
not delete or soften a line because it was questioned; verify it. A correct
finding removed under mild objection is the same failure as a fabricated one.

## Paths

- Contract files: `.ai-kit/*.kit.md` (YAML frontmatter + markdown)
- Registry: `.ai-kit/kit.json` → `figmaComponents`
- UI kit types: `../ui-kit/src/components/<Component>/<Component>.types.ts`
- Token manifest: `.ai-kit/tokens.txt` (generated from the ui-kit CSS)
- Audit script: `.ai-kit/bin/kit-audit.mjs`
- Report output: `.ai-kit/sync-report.md`

## Step 0 — offline facts (run FIRST, no Figma required)

Neither command needs Figma, so both run **before** the Figma gate. When Figma
Desktop is down these still constitute the entire offline half of the sync, and
must still be reported.

```bash
node .ai-kit/bin/gen-tokens.mjs
node .ai-kit/bin/kit-audit.mjs
```

**`gen-tokens.mjs`** prints `unchanged` or `updated: … (N tokens)`. If it updated
the file, get the names that moved:

```bash
node .ai-kit/bin/gen-tokens.mjs --check   # exits 0 once regenerated
git diff -- .ai-kit/tokens.txt
```

Writing the manifest is safe to do automatically — it is a purely derived flat
list, the safest possible auto-update.

**`kit-audit.mjs`** derives the four things this skill used to ask the model to
work out by reading files: the auditable component set, contract `values` vs the
ui-kit TypeScript unions, registry-vs-disk consistency, and shim debt.

| Exit | Meaning |
|---|---|
| 0 | consistent — no ERROR rows |
| 1 | every `ERROR` row is a real defect; fix or report each one |
| 2 | the audit could not run (missing input). **Never read this as "clean"** — say the audit failed |

Paste its output verbatim into the report. Do not paraphrase it, do not
summarise it into ✓ marks, and do not re-derive any line it already prints.

## Figma tool — hard requirement

**Only `mcp__figma-desktop__get_design_context` is permitted.** Never use any remote Figma MCP tool.

After Step 0, verify the tool is available. If `mcp__figma-desktop__get_design_context` is not accessible, stop immediately and output:

```
❌ sync-ai-map: mcp__figma-desktop__get_design_context is not available.
Open Figma Desktop and ensure the local MCP server is running, then retry.
(Step 0 already ran — the token and audit results above still stand.)
```

Do not proceed, do not fall back to a remote tool.

---

## Workflow — the Figma half, the only part no script can do

### 1. Take the scope from the audit, not from a directory listing

`kit-audit.mjs` prints an `AUDITABLE COMPONENTS` line. That list — components
holding **both** a `.kit.md` contract and a `../ui-kit/src/components/<Name>/`
implementation — is the complete scope. Query Figma for these and no others.

A name outside that list is out of scope *because a claim about it could not be
falsified*: with no contract there is nothing to diff Figma against, and with no
implementation there is no TypeScript union to validate against.

In particular, `kit.json → figmaComponents` also holds **registry-only** entries
(`tokens-only`, `missing`) that are deliberately not ui-kit components. kit-audit
already verifies those mechanically — their token family exists, their declared
stub exists — and prints the result. Report those rows as printed. Never open
them in Figma and never describe their contents from the registry alone.

### 2. Fetch Figma state

For each auditable component whose audit row shows `props-in-scope>0`:

```
mcp__figma-desktop__get_design_context(figmaNodeId)   # node id from the audit row
```

`props-in-scope=0` means the contract declares nothing enum-shaped (no prop with
both `values` and `figmaVariant`) — there is nothing to diff. Record that as the
reason and skip the call rather than fetching and eyeballing the design.

If a node is too large and returns sparse metadata instead of code, the variant
names are in the `<symbol name="Variant=…, Size=…">` attributes; that is a valid
source. If you cannot obtain values for a component, write `NOT_CHECKED` with the
reason — never infer them from the layer name or from the contract you are testing.

### 3. Diff, recording both sides

For each in-scope prop, compare the values **observed in the MCP response**
against `contract.props[<prop>].values`. Write both sets into the report so a
reader can reproduce the comparison without re-running Figma.

| Category | Definition |
|---|---|
| `NEW_VALUE` | value in Figma, not in contract |
| `REMOVED_VALUE` | value in contract, not in Figma |
| `NEW_PROPERTY` | figmaVariant in Figma, no matching prop in contract |
| `REMOVED_PROPERTY` | prop in contract with figmaVariant, not found in Figma |

Figma spells variants `Primary`/`XL`; contracts spell them `primary`/`xl`. That
casing difference is the documented mapping, not drift.

### 4. Apply safe changes

A `NEW_VALUE` is safe to add **only if kit-audit already reported that the kit
implements it** — that is the `INFO … kit also implements [x] — undocumented in
the contract` row. That row is the mechanical proof the value exists in the
TypeScript union; do not re-check the union by hand, and do not add a value that
has no such row.

Add safe values to the `values` array in the contract frontmatter. Do **not**
modify the contract for:

- `REMOVED_VALUE` — Figma may be mid-edit; flag only
- `NEW_VALUE` with no matching INFO row — the component code must change first
- `NEW_PROPERTY` / `REMOVED_PROPERTY` — structural, needs manual review

### 5. Verify

Both must pass. Run them even if you changed nothing — a green pair is what
distinguishes a completed run from an abandoned one.

```bash
node .ai-kit/bin/kit-audit.mjs                  # must exit 0
cd ../ui-kit && npx --no-install tsc --noEmit   # must exit 0
```

If either fails, revert the contract edits for the affected component and add a
`TS_ERROR` entry quoting the actual output.

### 6. Act on the registry and shim rows

kit-audit has already classified these; your job is the follow-up work it cannot do:

- `🗑 INFO … NOW in <Component>Variant` — the kit implements a variant that is
  still shimmed. Delete the class from `src/shims/`, migrate every usage
  (`grep -rn "shim\.<class>\|shims/<Component>" src/`), and set the registry
  entry to `implemented`. List the usages in the report.
- `ERROR` — a registry claim contradicts the disk. Fix the registry to match
  reality; never adjust the disk to match the registry.
- `OK … still shim` — leave it; it appears under Shim debt so the backlog stays visible.

### 7. Write the report

Save to `.ai-kit/sync-report.md`:

```markdown
# AI-kit sync report — <ISO date>

## Summary
- Auditable components: N        (from kit-audit `AUDITABLE COMPONENTS`)
- Components queried in Figma: N (of those, the ones with props-in-scope>0)
- Safe updates applied: N
- Items needing attention: N

## Offline audit (verbatim)

`node .ai-kit/bin/gen-tokens.mjs` → <unchanged | updated: … / added / removed>

\`\`\`
<full stdout of: node .ai-kit/bin/kit-audit.mjs>
\`\`\`

Exit code: <0|1|2>

## Figma diff

### <ComponentName> — node <id>
- `<prop>` (figmaVariant `<Variant>`): Figma [a, b, c] · contract [a, b, c] → match
- ✅ NEW_VALUE `<v>` added to `<prop>.values` (kit implements it — INFO row above)
- ⚠️ NEW_VALUE `<v>` for `<prop>` — no INFO row, update `<Component>.types.ts` first
- ⚠️ REMOVED_VALUE `<v>` from `<prop>` — contract keeps it, verify with the Figma owner
- ⚠️ NEW_PROPERTY `<figmaVariant>` — no matching prop in contract
- ⚠️ REMOVED_PROPERTY `<prop>` — figmaVariant `<x>` no longer in Figma

### <ComponentName> — SKIPPED, props-in-scope=0 (nothing enum-shaped to diff)
### <ComponentName> — NOT_CHECKED (<reason>)

## Verification
- `node .ai-kit/bin/kit-audit.mjs` → exit <n>
- `npx --no-install tsc --noEmit` (in ../ui-kit) → exit <n>
- ❌ TS_ERROR — changes reverted, output below

## Shim debt
<the OK/INFO shim rows from the audit, as printed>

## Registry-only entries (not ui-kit components, not queried in Figma)
<the registry rows from the audit, as printed>
```

After writing the report, print its full content to the conversation.
