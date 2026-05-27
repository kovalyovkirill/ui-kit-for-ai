---
component: Badge
import: "@monorepo/ui-kit"
figmaNodeId: "1:12502"
figmaLayer: "Badge"
props:
  variant:  { values: [primary, secondary, bordered, danger, success, warning], default: primary, figmaVariant: Variant }
  size:     { values: [sm, md, lg], default: sm, figmaVariant: Size }
  children: { type: ReactNode, note: "badge label text" }
---

# Badge

A small pill label for status, category, or count. Renders as `<span>` (inline).

## Variant mapping

| Figma Variant | `variant`  | Background | Foreground |
|---|---|---|---|
| Primary   | primary   | `--badge-primary-background` (#1072ea) | white |
| Secondary | secondary | `--badge-secondary-background` (#f5f5f5) | #0f0f10 |
| Bordered  | bordered  | none | `--badge-bordered-foreground` (#0f0f10) |
| Danger    | danger    | `--badge-danger-background` (#eb3a2d) | white |
| Success   | success   | `--badge-success-background` (#0ebe89) | white |
| Warning   | warning   | `--badge-warning-background` (#ff8c1a) | white |

## Size mapping

| Figma Size | `size` | Padding-x |
|---|---|---|
| SM | sm |  8 px |
| MD | md | 12 px |
| LG | lg | 16 px |

Vertical padding: 2 px for all sizes. Text: `Label/SM` (12 px / Medium 500) for all sizes.

## Design tokens

`--badge-primary-background` · `--badge-secondary-background` · `--badge-danger-background`
`--badge-success-background` · `--badge-warning-background`
`--badge-bordered-border` · `--badge-bordered-border-width`
`--badge-radius` · `--badge-padding-y`
`--badge-padding-x-sm` · `--badge-padding-x-md` · `--badge-padding-x-lg`

## Examples

```tsx
// Variant=Primary, Size=SM
<Badge variant="primary" size="sm">New</Badge>

// Variant=Success, Size=MD
<Badge variant="success" size="md">Active</Badge>

// Variant=Danger, Size=SM
<Badge variant="danger" size="sm">Error</Badge>

// Variant=Bordered, Size=LG
<Badge variant="bordered" size="lg">Draft</Badge>
```
