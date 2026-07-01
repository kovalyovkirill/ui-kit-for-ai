# AI-kit sync report — 2026-07-01

Source: Pixso Desktop MCP (`mcp__pixso-desktop__get_variants`), file `dJRiDr4Ixp89b2OcUPanKg`.
First run after the Figma → Pixso migration (node IDs preserved from the .fig import).

## Summary
- Components checked: 7
- Safe updates applied: 0
- Items needing attention: 0

## Changes applied

_None._

## Needs attention

_None._

> Note: Button `Variant` in Pixso also has `Bordered`, `Clear`, `Ghost` — `Button.kit.md` already acknowledges these as designed but not yet implemented. No contract change needed until the TS type is extended.

## No changes
- Button — contract matches Pixso ✓ (`variant`, `size`)
- Badge — contract matches Pixso ✓ (`variant`, `size`)
- Avatar — contract matches Pixso ✓ (`size`)
- Checkbox — contract matches Pixso ✓ (`size`)
- Input — contract matches Pixso ✓ (`size`)
- Typography — no variant properties, skipped
- ButtonGroup — no variant properties, skipped
