---
component: Button
import: "@monorepo/ui-kit"
figmaNodeId: "1:10688"
figmaLayer: "Button"
props:
  variant:   { values: [primary, secondary, link], default: primary, figmaVariant: Variant }
  size:      { values: [sm, md, lg, xl], default: xl, figmaVariant: Size }
  leftIcon:  { type: ReactNode, note: "icon before label; alone (no children) = icon-only square, Figma Icon=True" }
  rightIcon: { type: ReactNode, note: "icon after label" }
  children:  { type: ReactNode, note: "button label; omit with leftIcon only for icon-only mode" }
  disabled:  { type: boolean, default: false, figmaState: Disabled }
  type:      { values: [button, submit, reset], default: button }
---

# Button

Use for all clickable actions. For a segmented filter/switcher, use `ButtonGroup` instead.

## Variant mapping

| Figma Variant | `variant`   | Description |
|---|---|---|
| Primary   | primary   | Brand-filled. Main CTA. |
| Secondary | secondary | Muted background. Secondary actions. |
| Link      | link      | No background/border. Inline or low-emphasis. |

> `Bordered`, `Clear`, `Ghost` exist in Figma but are not yet implemented.

## Size mapping

| Figma Size | `size` | Height | Icon-only |
|---|---|---|---|
| SM | sm | 32 px | 32×32 px |
| MD | md | 40 px | 40×40 px |
| LG | lg | 48 px | 48×48 px |
| XL | xl | 56 px | 56×56 px |

## State mapping

| Figma State | How to produce |
|---|---|
| Default  | no extra props |
| Hover    | CSS `:hover` (automatic) |
| Active   | CSS `:active` (automatic) |
| Focus    | CSS `:focus-visible` (automatic) |
| Disabled | `disabled` |

## Examples

```tsx
// Variant=Primary, Size=XL
<Button variant="primary" size="xl">Publish</Button>

// Variant=Secondary, Size=MD
<Button variant="secondary" size="md">Cancel</Button>

// Variant=Primary, Size=MD, Icon=True (icon-only)
<Button variant="primary" size="md" leftIcon={<SomeIcon />} />

// Variant=Primary, Size=LG, Disabled
<Button variant="primary" size="lg" disabled>Save</Button>

// Variant=Link, Size=SM
<Button variant="link" size="sm">Learn more</Button>
```
