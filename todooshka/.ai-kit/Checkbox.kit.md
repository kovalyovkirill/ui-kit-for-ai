---
component: Checkbox
import: "@monorepo/ui-kit"
nodeId: "1:11892"
layer: "Checkbox"
props:
  size:           { values: [sm, md, lg], default: md, variantProperty: Size }
  label:          { type: string, note: "text to the right of the box" }
  checked:        { type: boolean, stateProperty: Checked, note: "controlled" }
  defaultChecked: { type: boolean, note: "uncontrolled initial state" }
  disabled:       { type: boolean, default: false, stateProperty: Disabled }
  onChange:       { type: "ChangeEventHandler<HTMLInputElement>" }
  id:             { type: string }
---

# Checkbox

Use for boolean opt-in/opt-out. Do not use for mutually exclusive options (use a radio group instead).

## Size mapping

| Pixso Size | `size` | Box | Border-radius | Stroke |
|---|---|---|---|---|
| SM | sm | 16×16 px | 5 px | 1.5 px |
| MD | md | 20×20 px | 6 px | 1.75 px |
| LG | lg | 24×24 px | 7 px | 2 px |

## State mapping

| Pixso State | How to produce |
|---|---|
| Unchecked | no `checked` / `defaultChecked` |
| Checked   | `checked` or `defaultChecked` |
| Hover     | CSS `:hover` (automatic) |
| Focus     | CSS `:focus-visible` (automatic) |
| Disabled  | `disabled` |

## Design tokens

`--checkbox-background-default` · `--checkbox-background-checked`
`--checkbox-border-default` · `--checkbox-border-hover` · `--checkbox-border-checked`
`--checkbox-border-width-default` · `--checkbox-border-width-checked`
`--checkbox-radius-sm` · `--checkbox-radius-md` · `--checkbox-radius-lg`
`--checkbox-size-sm` · `--checkbox-size-md` · `--checkbox-size-lg`
`--checkbox-checkmark` · `--accents-brand`

## Examples

```tsx
// Size=MD, Unchecked, no label
<Checkbox size="md" onChange={handleChange} />

// Size=MD, Checked, label
<Checkbox size="md" label="Remember me" defaultChecked />

// Size=LG, Disabled
<Checkbox size="lg" label="Notifications" disabled />
```
