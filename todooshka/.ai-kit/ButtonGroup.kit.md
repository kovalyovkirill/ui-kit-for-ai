---
component: ButtonGroup
import: "@monorepo/ui-kit"
figmaNodeId: "1:11314"
figmaLayer: "ButtonGroup"
subcomponents:
  - ButtonGroupItem
props:
  size:         { values: [sm, md, lg], default: md, note: "applied to all items" }
  orientation:  { values: [horizontal, vertical], default: horizontal, note: "Figma Vertical variant → vertical" }
  interactive:  { type: boolean, default: false, note: "enables radio-style selection" }
  value:        { type: string, note: "controlled selected value; only when interactive=true" }
  defaultValue: { type: string, note: "uncontrolled initial value; only when interactive=true" }
  onChange:     { type: "(value: string) => void", note: "only when interactive=true" }
  children:     { type: ReactNode, required: true, note: "should be ButtonGroupItem elements" }
itemProps:
  value:    { type: string, note: "required when parent is interactive" }
  active:   { type: boolean, default: false, note: "Figma With Active variant" }
  icon:     { type: boolean, default: false, note: "icon-only square cell; Figma With Icons variant" }
  children: { type: ReactNode }
---

# ButtonGroup / ButtonGroupItem

A segmented control — bordered container with adjacent cells separated by 1 px dividers.
Use for switching between views or filters. Do not use for primary actions (use `Button`).

## Size mapping

| Figma variant | `size` | Cell height | Text | Padding-x |
|---|---|---|---|---|
| Size SM       | sm | 32 px | Label/SM 12 px | 12 px |
| Default        | md | 40 px | Label/MD 14 px | 16 px |
| Size LG       | lg | 48 px | Label/MD 14 px | 20 px |

## Design tokens

`--border-default` · `--border-width-default` · `--radius-lg`
`--button-bordered-foreground-default` · `--button-primary-foreground-default`
`--accents-brand` · `--button-padding-x-sm` · `--button-padding-x-md` · `--button-padding-x-lg`
`--button-padding-y-sm` · `--button-padding-y-md` · `--button-padding-y-lg` · `--button-gap`

## Examples

```tsx
// Default — 3 items, MD, horizontal, no active
<ButtonGroup size="md">
  <ButtonGroupItem>Day</ButtonGroupItem>
  <ButtonGroupItem>Week</ButtonGroupItem>
  <ButtonGroupItem>Month</ButtonGroupItem>
</ButtonGroup>

// With Active — second item selected
<ButtonGroup size="md" interactive defaultValue="week">
  <ButtonGroupItem value="day">Day</ButtonGroupItem>
  <ButtonGroupItem value="week">Week</ButtonGroupItem>
  <ButtonGroupItem value="month">Month</ButtonGroupItem>
</ButtonGroup>

// Vertical
<ButtonGroup orientation="vertical">
  <ButtonGroupItem>Top</ButtonGroupItem>
  <ButtonGroupItem>Middle</ButtonGroupItem>
  <ButtonGroupItem>Bottom</ButtonGroupItem>
</ButtonGroup>
```
