---
component: Input
import: "@monorepo/ui-kit"
nodeId: "1:12018"
layer: "Input"
props:
  size:        { values: [sm, md, lg, xl], default: xl, variantProperty: Size }
  label:       { type: string, note: "visible when Pixso sub-layer Label is shown" }
  helperText:  { type: string, note: "present when State ≠ Error" }
  error:       { type: string, stateProperty: Error, note: "replaces helperText, activates red border" }
  disabled:    { type: boolean, default: false, stateProperty: Disabled }
  placeholder: { type: string }
  id:          { type: string, note: "auto-generated via useId() if omitted" }
---

# Input

Use for all single-line text entry. Do not use for multi-line text (use Textarea).

## Size mapping

| Pixso Size | `size` | Height | Text token |
|---|---|---|---|
| SM | sm | 32 px | Body/XS |
| MD | md | 40 px | Body/SM |
| LG | lg | 48 px | Body/MD |
| XL | xl | 56 px | Body/MD |

## State mapping

Pixso **State** is driven by native HTML and props — not a prop itself.

| Pixso State | How to produce |
|---|---|
| Default  | no extra props |
| Hover    | CSS `:hover` (automatic) |
| Focus    | CSS `:focus` (automatic) |
| Error    | `error="…"` |
| Disabled | `disabled` |

## Token naming rule

Pixso MCP outputs slash-separated names. Convert every `/` to `-` before writing CSS.
Example: `var(--neutrals\/surface)` → `var(--neutrals-surface)`

## Design tokens

`--input-border-default` · `--input-border-hover` · `--input-border-focus` · `--input-border-error` · `--input-border-disabled`
`--input-background-default` · `--input-background-disabled`
`--input-foreground-placeholder` · `--input-foreground-label` · `--input-foreground-helper` · `--input-foreground-error`
`--input-radius-sm` · `--input-radius-md` · `--input-radius-lg` · `--input-radius-xl`

## Examples

```tsx
// Size=XL, State=Default, label + helperText
<Input size="xl" label="Email" placeholder="you@example.com" helperText="We'll never share your email." />

// Size=MD, State=Error
<Input size="md" label="Password" placeholder="••••••••" error="This field is required" />

// Size=SM, State=Disabled, no label
<Input size="sm" placeholder="Search…" disabled />
```
