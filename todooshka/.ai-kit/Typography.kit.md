---
component: Typography
import: "@monorepo/ui-kit"
figmaNodeId: "1:13098"
figmaLayer: "_typography-content"
props:
  variant: { values: [display, h1, h2, h3, h4, h5, h6, bodyLg, body, bodySm, label, caption, overline], default: body }
  color:   { values: [foreground-primary, foreground-secondary, foreground-tertiary, foreground-quaternary, foreground-on-accent, accents-brand, accents-danger, accents-success, accents-warning, accents-info], default: foreground-primary }
  as:      { type: ElementType, note: "override rendered HTML tag when semantic differs from default" }
figmaStyleMap:
  "Display/2XL": h1
  "Display/XL":  h2
  "Display/LG":  h3
  "Display/MD":  h4
  "Display/SM":  h5
  "Body/XL":     null
  "Body/LG":     bodyLg
  "Body/MD":     body
  "Body/SM":     bodySm
  "Body/XS":     caption
  "Label/LG":    h6
  "Label/MD":    label
  "Label/SM":    caption
  "Label/XS":    overline
---

# Typography

Use for all text rendering. Tag is chosen automatically per variant; override with `as`.

## Figma text style → `variant` — THE lookup table

Figma text styles and `Typography` variants use **different naming schemes**. Never
map by name similarity (`Display/MD` is *not* `display`). Use only this table.

| Figma style | Figma metrics | `variant` | Fidelity |
|---|---|---|---|
| Display/2XL | 36 / 700 / 45 | `h1`     | ✅ exact |
| Display/XL  | 30 / 700 / 38 | `h2`     | ✅ exact |
| Display/LG  | 24 / 600 / 30 | `h3`     | ✅ exact |
| Display/MD  | 20 / 600 / 25 | `h4`     | ✅ exact |
| Display/SM  | 18 / 600 / 23 | `h5`     | ✅ exact |
| Body/LG     | 18 / 400 / 27 | `bodyLg` | ✅ exact |
| Body/MD     | 16 / 400 / 24 | `body`   | ✅ exact |
| Body/SM     | 14 / 400 / 21 | `bodySm` | ✅ exact |
| Body/XS     | 12 / 400 / 18 | `caption`| ✅ exact |
| Label/MD    | 14 / 500 / 21 | `label`  | ✅ exact |
| Label/XS    | 11 / 500 / 17 | `overline` | ⚠️ metrics exact, but adds `text-transform: uppercase` + `letter-spacing: .08em` |
| Label/LG    | 16 / 500 / 24 | `h6`     | ⚠️ size + line-height exact, weight 600 vs 500 |
| Label/SM    | 12 / 500 / 18 | `caption`| ⚠️ size + line-height exact, weight 400 vs 500 |
| Body/XL     | 20 / 400 / 30 | — | ❌ **no variant exists** — use `bodyLg` (18px) and report drift |

**Off-system text in Figma** (a raw `font-size` with no named style, e.g. `48px/700`):
pick the nearest variant by size and report it in the drift note. Do not hardcode
the px value — rule 3 forbids it.

## Variant → what actually renders

Derived from `Typography.module.css`, not from design intent. Note `display` and
`h1` are **identical** (both `display-2xl`); there is no 48px token in the kit.

| `variant` | Token family | Size | Weight | Line-height | Default tag |
|---|---|---|---|---|---|
| display  | display-2xl | 36 | 700 | 45 | `<p>` |
| h1       | display-2xl | 36 | 700 | 45 | `<h1>` |
| h2       | display-xl  | 30 | 700 | 38 | `<h2>` |
| h3       | display-lg  | 24 | 600 | 30 | `<h3>` |
| h4       | display-md  | 20 | 600 | 25 | `<h4>` |
| h5       | display-sm  | 18 | 600 | 23 | `<h5>` |
| h6       | label-lg    | 16 | 600 | 24 | `<h6>` |
| bodyLg   | body-lg     | 18 | 400 | 27 | `<p>` |
| body     | body-md     | 16 | 400 | 24 | `<p>` |
| bodySm   | body-sm     | 14 | 400 | 21 | `<p>` |
| label    | label-md    | 14 | 500 | 21 | `<span>` |
| caption  | body-xs     | 12 | 400 | 18 | `<span>` |
| overline | label-xs    | 11 | 500 | 17 | `<span>` — UPPERCASE |

## Colors

`color` accepts the full `TypographyColor` union — every `--foreground-*`,
`--neutrals-*`, `--border-*`, `--accents-*`, `--tint-*`, `--interactive-*` and
`--focus-ring-*` semantic token. The prop value is the token name **without** the
leading `--`: `color="accents-brand"` → `var(--accents-brand)`.

## Known drift (kit ↔ Figma)

Report these; do not silently paper over them.

1. `Body/XL` (20/400) has no variant.
2. `Label/LG` and `Label/SM` have no weight-accurate variant (`h6` / `caption` are the nearest).
3. `display` duplicates `h1` — the documented 48px display step does not exist as a token.

## Examples

```tsx
// Figma style Display/2XL
<Typography variant="h1">Гляди на главное</Typography>

// Figma style Body/MD, secondary colour
<Typography variant="body" color="foreground-secondary">Осталось 4 задачи</Typography>

// Figma style Label/XS (count badge)
<Typography variant="overline" color="foreground-secondary">12</Typography>

// H2 style rendered as <h1> (only one h1 per page)
<Typography variant="h2" as="h1">Page Title</Typography>
```
