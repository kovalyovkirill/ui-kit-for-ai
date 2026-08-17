---
component: Textarea
import: "@monorepo/ui-kit"
figmaNodeId: "1:12424"
figmaLayer: "Textarea"
props:
  size:        { values: [sm, md, lg, xl], default: xl, figmaVariant: Size }
  label:       { type: string, note: "visible when Figma sub-layer Label is shown" }
  helperText:  { type: string, note: "present when State ≠ Error" }
  error:       { type: string, figmaState: Error, note: "replaces helperText, activates red border" }
  disabled:    { type: boolean, default: false, figmaState: Disabled }
  placeholder: { type: string }
  id:          { type: string, note: "auto-generated via useId() if omitted" }
---

# Textarea

Use for all multi-line text entry. For single-line use `Input`.

Rest props spread onto the native `<textarea>`, so `rows`, `maxLength`, `name`,
`onChange` and a `ref`-free `register()` spread all work. The field grows with
content: the size variant sets `min-height`, not a fixed height.

## Size mapping

| Figma Size | `size` | Min-height | Text token | Radius |
|---|---|---|---|---|
| SM | sm | 56 px | Body/SM | radius-sm (8px) |
| MD | md | 80 px | Body/SM | radius-lg (12px) |
| LG | lg | 112 px | Body/MD | radius-lg (12px) |
| XL | xl | 144 px | Body/MD | radius-xl (16px) |

Note the radius progression is **not** the same as `Input`'s (`Input` md uses
`input-radius-md`); take it from this table, not by analogy.

## State mapping

Figma **State** is driven by native HTML and props — not a prop itself.

| Figma State | How to produce |
|---|---|
| Default  | no extra props |
| Hover    | CSS `:hover` (automatic) |
| Focus    | CSS `:focus-within` (automatic) |
| Error    | `error="…"` |
| Disabled | `disabled` |

## Design tokens

This component has **no `textarea-*` token family** — Figma binds it straight to
the semantic layer. That is deliberate, and the `input-*` family must not be
substituted: the values coincide today, but they are different Figma variables.

`--neutrals-surface` · `--border-strong` · `--border-default` · `--border-width-default`
`--accents-info` (hover) · `--accents-brand` (focus) · `--accents-danger` (error)
`--foreground-primary` · `--foreground-quaternary` (placeholder) · `--foreground-tertiary` (helper, disabled)
`--radius-sm` · `--radius-lg` · `--radius-xl` · `--spacing-1` · `--spacing-2` · `--spacing-3`

**Off-system:** the four `min-height` values (56/80/112/144 px) are literals in
`Textarea.module.css`. Figma hardcodes them on the variants instead of binding a
variable, so there is nothing to reference. If a variable appears, replace the
literals — they carry an `/* off-system: … */` marker.

## Examples

```tsx
// Size=XL, State=Default, label + helperText
<Textarea size="xl" label="Описание" placeholder="Ты всё знаешь" helperText="Но это не точно" />

// Size=MD, State=Error
<Textarea size="md" label="Описание" error="This field is required" />

// Size=MD, State=Disabled, no label
<Textarea size="md" placeholder="Enter text here…" disabled />
```
