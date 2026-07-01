---
name: sync-ai-map
description: Syncs .ai-kit/*.kit.md contract files against the live Pixso library and ui-kit TypeScript types. Detects new/removed variant values and properties, updates the contract where safe, and produces a drift report. Use this skill whenever the user says "обнови ai-map", "Pixso изменился", "проверь маппинг", "sync the kit", "check component drift", "update the contract", or any time a ui-kit component's Pixso design or TypeScript types may have changed.
---

# sync-ai-map

Keeps `.ai-kit/*.kit.md` in sync with the Pixso library and ui-kit TypeScript types.

## Paths

- Contract files: `.ai-kit/*.kit.md` (YAML frontmatter + markdown)
- UI kit types: `../ui-kit/src/components/<Component>/<Component>.types.ts`
- Report output: `.ai-kit/sync-report.md`

## Pixso tool — hard requirement

**Only `mcp__pixso-desktop__get_variants` is permitted for reading design state.** Never use any other design MCP tool.

Before doing anything else, verify the tool is available. If `mcp__pixso-desktop__get_variants` is not accessible, stop immediately and output:

```
❌ sync-ai-map: mcp__pixso-desktop__get_variants is not available.
Open Pixso Desktop with the design file and ensure the local MCP server is running, then retry.
```

Do not proceed, do not fall back to another tool.

---

## Workflow

### 1. Read the contract

Parse every `.ai-kit/*.kit.md`. From each file extract:
- `component` — component name
- `nodeId` — Pixso component-set node to inspect
- `props` — map of prop names to `{ values, variantProperty, stateProperty, type }`

Only props with a `values` array and a `variantProperty` field are in scope for diffing — these are the enum-style props driven by Pixso variant properties. Skip `type: boolean` and `type: string` props. If a contract has no in-scope props (e.g. Typography, ButtonGroup), record it as `no variant properties — skipped` and do not call Pixso for it.

### 2. Fetch Pixso state

For each component with in-scope props, call:
```
mcp__pixso-desktop__get_variants(guid: nodeId)
```

The response is a flat list of variant components whose `name` encodes the property matrix: `"Variant=Primary, Size=XL, Icon=False, State=Default"`. Parse every name: split on `, `, then on `=`, and collect for each property name the full set of unique values across all variants.

An empty response (`[]`) for a component that has in-scope props means the node is not a variant set — flag it in the report as `NODE_NOT_A_VARIANT_SET` and skip diffing.

### 3. Diff

For each in-scope prop, compare Pixso values (for the property named by `variantProperty`) against `contract.props[prop].values`. Compare case-insensitively: Pixso values are TitleCase (`Primary`), contract values are lowercase (`primary`).

Classify every difference:

| Category | Definition |
|---|---|
| `NEW_VALUE` | value in Pixso, not in contract |
| `REMOVED_VALUE` | value in contract, not in Pixso |
| `NEW_PROPERTY` | property in Pixso variant names, no matching prop in contract (ignore properties covered by `stateProperty` or documented as CSS-driven, e.g. `State`, `Icon`) |
| `REMOVED_PROPERTY` | prop in contract with `variantProperty`, property not found in Pixso |

### 4. Validate NEW_VALUE against TypeScript types

For each `NEW_VALUE`, check whether the value already exists in the ui-kit TypeScript type:

1. Read `../ui-kit/src/components/<Component>/<Component>.types.ts`
2. Find the union type for that prop (look for the `@designValues` JSDoc tag or the TypeScript union literal — e.g., `'primary' | 'secondary' | 'link'`)
3. Decide:
   - Value found in TS type → **safe to add** to contract
   - Value not found → **needs type update** — flag in report, do not add to contract

### 5. Apply safe changes

Only modify contract files for changes classified as safe:
- `NEW_VALUE` where the value exists in the TS type → add to `values` array in frontmatter (lowercase, matching contract convention)

Do **not** modify the contract for:
- `REMOVED_VALUE` — Pixso may have a temporary state; flag only
- `NEW_VALUE` needing a TS type update — component code must change first
- `NEW_PROPERTY` / `REMOVED_PROPERTY` — structural changes need manual review

### 6. Verify

After applying changes, run from the ui-kit directory:
```bash
tsc --noEmit
```

If it fails, revert the contract changes for the affected component and add a `TS_ERROR` entry to the report.

### 7. Write the report

Save to `.ai-kit/sync-report.md`. Use this structure:

```markdown
# AI-kit sync report — <ISO date>

## Summary
- Components checked: N
- Safe updates applied: N
- Items needing attention: N

## Changes applied

### <ComponentName>
- ✅ NEW_VALUE `<value>` added to `<prop>.values`

## Needs attention

### <ComponentName>
- ⚠️ NEW_VALUE `<value>` for `<prop>` — not in TS type, update `<Component>.types.ts` first
- ⚠️ REMOVED_VALUE `<value>` from `<prop>` — still in contract, verify with design owner
- ⚠️ NEW_PROPERTY `<property>` — no matching prop in contract
- ⚠️ REMOVED_PROPERTY `<prop>` — variantProperty `<x>` no longer in Pixso
- ⚠️ NODE_NOT_A_VARIANT_SET — `nodeId` returned no variants, check the node in Pixso
- ❌ TS_ERROR — changes reverted, see tsc output below

## No changes
- <ComponentName> — contract matches Pixso ✓
- <ComponentName> — no variant properties, skipped
```

After writing the report, print its full content to the conversation so the user sees it immediately.
