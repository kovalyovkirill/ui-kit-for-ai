# AI-kit sync report — 2026-05-27

## Summary
- Components checked: 7
- Safe updates applied: 0
- Items needing attention: 3

## Changes applied

_None — no safe updates this run._

## Needs attention

### Button
- ⚠️ NEW_VALUE `bordered` for `variant` — not in TS type (`ButtonVariant = 'primary' | 'secondary' | 'link'`), update `Button.types.ts` first
- ⚠️ NEW_VALUE `clear` for `variant` — not in TS type, update `Button.types.ts` first
- ⚠️ NEW_VALUE `ghost` for `variant` — not in TS type, update `Button.types.ts` first

> Note: `Button.kit.md` already acknowledges these: "`Bordered`, `Clear`, `Ghost` exist in Figma but are not yet implemented." No contract change needed until the TS type is extended.

## No changes
- Badge — contract matches Figma ✓
- Avatar — contract matches Figma ✓
- Checkbox — contract matches Figma ✓
- Input — contract matches Figma ✓
- Typography — no `figmaVariant` props; out of scope ✓
- ButtonGroup — no `figmaVariant` props; out of scope ✓
