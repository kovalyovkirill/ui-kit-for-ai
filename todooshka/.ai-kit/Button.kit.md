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

## Unimplemented variants → shim (do NOT hand-roll)

`Bordered`, `Clear`, `Ghost` exist in Figma but the kit does not implement them.
A Figma Button instance still always renders as a kit `<Button>`: pick the base
variant below and attach the shim class from
`src/shims/button-variants.module.css`. Detect which variant you are looking at
from the **token names in the MCP output** — never from the layer name.

| Tokens in MCP output | Figma Variant | Render as |
|---|---|---|
| `--button-ghost-*`    | Ghost    | `<Button variant="link" className={shim.ghost}>` |
| `--button-clear-*`    | Clear    | `<Button variant="link" className={shim.clear}>` |
| `--button-bordered-*` | Bordered | `<Button variant="secondary" className={shim.bordered}>` |

Shim rules (already encoded in the CSS file — listed here so nobody re-derives
them): doubled selectors (`.ghost.ghost`) to beat kit specificity; only
`var(--button-*)` / `var(--focus-ring-*)` values; token gaps closed by contract,
not invented — Clear/Bordered have no focus-ring token → `--focus-ring-neutral`;
Clear has no hover-foreground and Bordered no hover-border → pinned to defaults.

Registry: `kit.json → figmaComponents.Button.variants`. `/sync-ai-map` reports
when a shim class is ready for deletion — tokens.txt won't (tokens pre-exist).

Kit facts from a one-time source read (2026-08-11), recorded so generation never
opens ui-kit source: focus ring is `outline: 2px solid <ring>; outline-offset: 2px`;
base `.button` sets `text-decoration: none` and `border: 1px solid transparent`;
`link` recolors text on hover via `--button-link-foreground-hover` — shims that
must not recolor pin `color` in `:hover` explicitly.

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
