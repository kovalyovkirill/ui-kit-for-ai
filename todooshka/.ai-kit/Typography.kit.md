---
component: Typography
import: "@monorepo/ui-kit"
nodeId: "1:13098"
layer: "_typography-content"
props:
  variant: { values: [display, h1, h2, h3, h4, h5, h6, bodyLg, body, bodySm, label, caption, overline], default: body, note: "maps to Pixso layer name" }
  color:   { values: [foreground-primary, foreground-secondary, foreground-tertiary, foreground-quaternary, foreground-on-accent, accents-brand, accents-danger, accents-success, accents-warning, accents-info], default: foreground-primary }
  as:      { type: ElementType, note: "override rendered HTML tag when semantic differs from default" }
---

# Typography

Use for all text rendering — headings, body, labels, captions, overlines. Tag is chosen automatically per variant; override with `as` when needed.

## Variant mapping

| Pixso layer | `variant` | Size | Weight | Line-height | Default tag |
|---|---|---|---|---|---|
| Display | display | 48 px | 700 | 1.1  | `<p>` |
| H1      | h1      | 36 px | 700 | 1.15 | `<h1>` |
| H2      | h2      | 30 px | 700 | 1.2  | `<h2>` |
| H3      | h3      | 24 px | 700 | 1.25 | `<h3>` |
| H4      | h4      | 20 px | 600 | 1.3  | `<h4>` |
| H5      | h5      | 18 px | 600 | 1.35 | `<h5>` |
| H6      | h6      | 16 px | 600 | 1.4  | `<h6>` |
| Body LG | bodyLg  | 18 px | 400 | 1.6  | `<p>` |
| Body    | body    | 16 px | 400 | 1.6  | `<p>` |
| Body SM | bodySm  | 14 px | 400 | 1.5  | `<p>` |
| Label   | label   | 14 px | 500 | 1.4  | `<span>` |
| Caption | caption | 12 px | 400 | 1.4  | `<span>` |
| Overline| overline| 11 px | 600 | 1.4  | `<span>` |

## Color → token mapping

| `color` | CSS token |
|---|---|
| foreground-primary    | `--foreground-primary` |
| foreground-secondary  | `--foreground-secondary` |
| foreground-tertiary   | `--foreground-tertiary` |
| foreground-quaternary | `--foreground-quaternary` |
| foreground-on-accent  | `--foreground-on-accent` |
| accents-brand         | `--accents-brand` |
| accents-danger        | `--accents-danger` |
| accents-success       | `--accents-success` |
| accents-warning       | `--accents-warning` |
| accents-info          | `--accents-info` |

Full list: see `TypographyColor` in `Typography.types.ts`.

## Examples

```tsx
// Pixso layer H1
<Typography variant="h1">Getting Started</Typography>

// Pixso layer Body SM, color foreground-tertiary
<Typography variant="bodySm" color="foreground-tertiary">Last updated 3 minutes ago</Typography>

// Pixso layer Caption, error state
<Typography variant="caption" color="accents-danger">This field is required</Typography>

// H2 style rendered as <h1> (only one h1 on page)
<Typography variant="h2" as="h1">Page Title</Typography>
```
