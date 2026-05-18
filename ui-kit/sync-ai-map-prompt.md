# Sync `ai-map.ts` with Figma — Session Prompt

Sync `src/ai-map.ts` with the current Figma component variants.
Report every difference found and update the file.

---

## Workflow

### 1. Read the current map

Read `src/ai-map.ts`. For each entry collect:
- `figmaNodeId`
- `variants` keys and their current value mappings

### 2. Fetch Figma variants for each component

For every component in `AI_MAP` call:
```
mcp__figma-desktop__get_design_context(nodeId: "<figmaNodeId>")
```

The response is a `<frame>` containing `<symbol>` elements. Each symbol's `name`
attribute encodes its variant combination:
```
Variant=Primary, Size=XL, Icon=False, State=Default
```

Parse all symbol names and collect **unique values per property key**.
Example extraction for Button:
```
Variant  → [Primary, Secondary, Bordered, Clear, Link, Ghost]
Size     → [SM, MD, LG, XL]
Icon     → [True, False]
State    → [Default, Hover, Active, Focus, Disabled]
```

### 3. Diff against ai-map.ts

For each component and each variant property compare Figma values vs current
`ai-map.ts` entries. Categorise every difference as one of:

| Category | Meaning |
|---|---|
| `NEW_VALUE` | Value exists in Figma, missing from ai-map |
| `REMOVED_VALUE` | Value in ai-map no longer exists in Figma |
| `NEW_PROPERTY` | Entire variant property exists in Figma, not in ai-map |
| `REMOVED_PROPERTY` | Property in ai-map no longer exists in Figma |

**Skip** `State` properties — they map to CSS / boolean props, not variant
mappings, and are already handled via `stateProps`.

### 4. Report differences

Print a summary before making any changes:

```
Button.variants.Variant
  NEW_VALUE    Bordered  (not yet in TypeScript type — needs type update first)
  NEW_VALUE    Clear     (not yet in TypeScript type — needs type update first)
  NEW_VALUE    Ghost     (not yet in TypeScript type — needs type update first)

Badge — no changes
Input — no changes
...
```

For each `NEW_VALUE`: check whether the target TypeScript type already includes
the mapped prop value (e.g. does `ButtonVariant` include `'bordered'`?).
- If yes → add to ai-map directly.
- If no → note it as **needs type update** and skip the ai-map change. Do not
  add invalid values that would break the `satisfies` constraint.

### 5. Update ai-map.ts

Apply all safe changes (where the TypeScript type already supports the value).
Use the naming convention below to derive the prop value from the Figma value.

For entries that need a type update, add a `// TODO: add to TypeScript type`
inline comment as a placeholder so drift is visible.

---

## Naming convention — Figma value → TypeScript prop value

| Figma value | Rule | Result |
|---|---|---|
| `Primary` | lowercase | `primary` |
| `Body LG` | camelCase (space = next char uppercase) | `bodyLg` |
| `Body SM` | same | `bodySm` |
| `True` / `False` | map to boolean prop directly, skip variant map | — |

General rule: lowercase first char, capitalise first char after each space,
remove spaces.

---

## Constraints

- Never remove an existing mapping without explicit user confirmation — a
  removed Figma variant may still be used in production designs.
- Never change a `figmaNodeId` — if Figma returns no symbols for a node,
  report it and stop; do not guess a replacement ID.
- Preserve all `notes` fields verbatim unless the user asks to update them.
- Run `tsc --noEmit` in the `ui-kit/` root after writing to confirm no type errors.

---

## Done

After updating, reply with:
```
Sync complete.
  Updated: <list of components with changes>
  Skipped (type update needed): <list>
  No changes: <list>
```
