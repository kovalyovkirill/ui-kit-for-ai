---
name: sync-ai-map
description: Syncs .ai-kit/*.kit.md contract files against the live Figma library and ui-kit TypeScript types. Detects new/removed variant values and properties, updates the contract where safe, and produces a drift report. Use this skill whenever the user says "обнови ai-map", "Figma изменился", "проверь маппинг", "sync the kit", "check component drift", "update the contract", or any time a ui-kit component's Figma design or TypeScript types may have changed.
---

# sync-ai-map

Keeps `.ai-kit/*.kit.md` in sync with the Figma library and ui-kit TypeScript types.

## Paths

- Contract files: `.ai-kit/*.kit.md` (YAML frontmatter + markdown)
- UI kit types: `../ui-kit/src/components/<Component>/<Component>.types.ts`
- Token manifest: `.ai-kit/tokens.txt` (generated from the ui-kit CSS)
- Report output: `.ai-kit/sync-report.md`

## Step 0 — token manifest (run FIRST, no Figma required)

Token drift needs no Figma at all, so this runs **before** the Figma gate below —
otherwise the cheapest offline check would be unavailable exactly when Figma Desktop
is down.

```bash
bash .ai-kit/bin/gen-tokens.sh
```

The script prints `unchanged` or `updated: … (N tokens)`. If it updated the file, get
the added/removed names for the report with:

```bash
bash .ai-kit/bin/gen-tokens.sh --check   # exits 0 once regenerated
git diff -- .ai-kit/tokens.txt
```

Writing the manifest is safe to do automatically — it is a purely derived flat list,
which makes it the safest possible auto-update, in keeping with this skill's existing
"apply safe changes" behaviour. Record the outcome for the `## Tokens` report section.

If Figma is unavailable, still report the token result before aborting.

## Figma tool — hard requirement

**Only `mcp__figma-desktop__get_design_context` is permitted.** Never use any remote Figma MCP tool.

After Step 0, verify the tool is available. If `mcp__figma-desktop__get_design_context` is not accessible, stop immediately and output:

```
❌ sync-ai-map: mcp__figma-desktop__get_design_context is not available.
Open Figma Desktop and ensure the local MCP server is running, then retry.
(Step 0 already ran — the token result above still stands.)
```

Do not proceed, do not fall back to a remote tool.

---

## Workflow

### 1. Read the contract

Parse every `.ai-kit/*.kit.md`. From each file extract:
- `component` — component name
- `figmaNodeId` — Figma node to inspect
- `props` — map of prop names to `{ values, figmaVariant, figmaState, type }`

Only props with a `values` array and a `figmaVariant` field are in scope for diffing — these are the enum-style props driven by Figma variant properties. Skip `type: boolean` and `type: string` props.

### 2. Fetch Figma state

For each component, call:
```
mcp__figma-desktop__get_design_context(figmaNodeId)
```

From the response, extract variant properties: for each property name that matches a `figmaVariant` in the contract, collect the full set of unique values currently present in Figma.

### 3. Diff

For each in-scope prop, compare Figma values against `contract.props[prop].values`.

Classify every difference:

| Category | Definition |
|---|---|
| `NEW_VALUE` | value in Figma, not in contract |
| `REMOVED_VALUE` | value in contract, not in Figma |
| `NEW_PROPERTY` | figmaVariant in Figma, no matching prop in contract |
| `REMOVED_PROPERTY` | prop in contract with figmaVariant, not found in Figma |

### 4. Validate NEW_VALUE against TypeScript types

For each `NEW_VALUE`, check whether the value already exists in the ui-kit TypeScript type:

1. Read `../ui-kit/src/components/<Component>/<Component>.types.ts`
2. Find the union type for that prop (look for `@values` JSDoc tag or the TypeScript union literal — e.g., `'primary' | 'secondary' | 'link'`)
3. Decide:
   - Value found in TS type → **safe to add** to contract
   - Value not found → **needs type update** — flag in report, do not add to contract

### 5. Apply safe changes

Only modify contract files for changes classified as safe:
- `NEW_VALUE` where the value exists in the TS type → add to `values` array in frontmatter

Do **not** modify the contract for:
- `REMOVED_VALUE` — Figma may have a temporary state; flag only
- `NEW_VALUE` needing a TS type update — component code must change first
- `NEW_PROPERTY` / `REMOVED_PROPERTY` — structural changes need manual review

### 6. Verify

After applying changes, run from the ui-kit directory:
```bash
tsc --noEmit
```

If it fails, revert the contract changes for the affected component and add a `TS_ERROR` entry to the report.

### 7. Registry & shim debt check

`kit.json → figmaComponents` records each Figma component's implementation
status; `src/shims/` holds the matching shim classes and stubs. **tokens.txt
cannot detect when the ui-kit implements a variant or component — the tokens
usually pre-exist the implementation — so this step is the only detector.**

For each registry entry with a `shim` variant or `tokens-only` status:
1. Check `../ui-kit/src/components/<Component>/<Component>.types.ts` for the
   variant value / component.
2. Implemented now → update the registry entry to `implemented` and add a
   `🗑 REMOVE` entry to the report naming the shim/stub file and every usage:
   `grep -rn "shim\.<class>\|shims/<Component>" src/`
3. Still missing → leave the entry as is, list it under "Shim debt" so the
   backlog stays visible.

### 8. Write the report

Save to `.ai-kit/sync-report.md`. Use this structure:

```markdown
# AI-kit sync report — <ISO date>

## Summary
- Components checked: N
- Safe updates applied: N
- Items needing attention: N

## Tokens
- `.ai-kit/tokens.txt` — fresh ✓   |   regenerated (commit it)
- Added: `--x`, `--y`
- Removed: `--z`

## Changes applied

### <ComponentName>
- ✅ NEW_VALUE `<value>` added to `<prop>.values`

## Needs attention

### <ComponentName>
- ⚠️ NEW_VALUE `<value>` for `<prop>` — not in TS type, update `<Component>.types.ts` first
- ⚠️ REMOVED_VALUE `<value>` from `<prop>` — still in contract, verify with Figma owner
- ⚠️ NEW_PROPERTY `<figmaVariant>` — no matching prop in contract
- ⚠️ REMOVED_PROPERTY `<prop>` — figmaVariant `<x>` no longer in Figma
- ❌ TS_ERROR — changes reverted, see tsc output below

## Shim debt
- Button.ghost — still `shim` (kit types unchanged)
- Card — still `tokens-only`
- 🗑 Button.ghost — implemented in kit: delete `.ghost` from
  `src/shims/button-variants.module.css`, migrate N usages (list them)

## No changes
- <ComponentName> — contract matches Figma ✓
```

After writing the report, print its full content to the conversation so the user sees it immediately.
