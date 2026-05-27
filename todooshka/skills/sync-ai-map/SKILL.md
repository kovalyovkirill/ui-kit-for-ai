---
name: sync-ai-map
description: Syncs .ai-kit/*.kit.md contract files against the live Figma library and ui-kit TypeScript types. Detects new/removed variant values and properties, updates the contract where safe, and produces a drift report. Use this skill whenever the user says "обнови ai-map", "Figma изменился", "проверь маппинг", "sync the kit", "check component drift", "update the contract", or any time a ui-kit component's Figma design or TypeScript types may have changed.
---

# sync-ai-map

Keeps `.ai-kit/*.kit.md` in sync with the Figma library and ui-kit TypeScript types.

## Paths

- Contract files: `.ai-kit/*.kit.md` (YAML frontmatter + markdown)
- UI kit types: `../ui-kit/src/components/<Component>/<Component>.types.ts`
- Report output: `.ai-kit/sync-report.md`

## Figma tool — hard requirement

**Only `mcp__figma-desktop__get_design_context` is permitted.** Never use any remote Figma MCP tool.

Before doing anything else, verify the tool is available. If `mcp__figma-desktop__get_design_context` is not accessible, stop immediately and output:

```
❌ sync-ai-map: mcp__figma-desktop__get_design_context is not available.
Open Figma Desktop and ensure the local MCP server is running, then retry.
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
- ⚠️ REMOVED_VALUE `<value>` from `<prop>` — still in contract, verify with Figma owner
- ⚠️ NEW_PROPERTY `<figmaVariant>` — no matching prop in contract
- ⚠️ REMOVED_PROPERTY `<prop>` — figmaVariant `<x>` no longer in Figma
- ❌ TS_ERROR — changes reverted, see tsc output below

## No changes
- <ComponentName> — contract matches Figma ✓
```

After writing the report, print its full content to the conversation so the user sees it immediately.
