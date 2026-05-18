# AI kit — Figma MCP Reference

This file maps Figma layer names, variant properties, and design tokens to the correct library components and props, so an MCP-driven agent can implement AI-kit designs without guessing.

---

## Input

**Import:** `import { Input } from '@monorepo/ui-kit'`

Maps to the Figma component set at node `1:12018` (layer name **"Input"**). Use for all single-line text entry fields. Do not use for multi-line text — that would need a `Textarea` component.

### When to use

- Figma layer named `Input`
- Variant property **Size** = `SM` / `MD` / `LG` / `XL`
- Variant property **State** = `Default` / `Hover` / `Focus` / `Error` / `Disabled`
- Layer contains sub-layers **Label** and/or **Helper text**

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'xl'` | Controls height, padding, border-radius, and text size. Maps to Figma **Size** variant. |
| `label` | `string` | — | Renders a `<label>` above the field. Present when Figma sub-layer **Label** is visible (`showLabel = true`). |
| `helperText` | `string` | — | Secondary text below the field. Present when Figma **Helper text** layer is visible and **State** ≠ `Error`. |
| `error` | `string` | — | Activates error state (red border) and replaces `helperText`. Use when Figma **State** = `Error`; the helper text layer switches to `--input/foreground/error`. |
| `disabled` | `boolean` | `false` | Mirrors Figma **State** = `Disabled` (50% opacity, muted border). Native HTML attribute. |
| `placeholder` | `string` | — | Placeholder text visible inside the field. Styled with `--input/foreground/placeholder`. Native HTML attribute. |
| `id` | `string` | auto | If omitted, a stable id is generated via `useId()` and wired to the label. Only set explicitly when you need a predictable DOM id. |

### Size mapping

| Figma Size | `size` | Height | Text style token |
|---|---|---|---|
| `SM` | `'sm'` | 32 px | `Body/XS` |
| `MD` | `'md'` | 40 px | `Body/SM` |
| `LG` | `'lg'` | 48 px | `Body/MD` |
| `XL` | `'xl'` | 56 px | `Body/MD` |

### State mapping

Figma **State** is not a prop — it is driven by native HTML behaviour and the `error`/`disabled` props.

| Figma State | How to produce it |
|---|---|
| `Default` | no extra props |
| `Hover` | CSS `:hover` (automatic) |
| `Focus` | CSS `:focus` (automatic) |
| `Error` | `error="…"` |
| `Disabled` | `disabled` |

### Design tokens referenced

| Token | Role |
|---|---|
| `--input/border/default` | Unchecked border (`#c2c1cd`) |
| `--input/border/hover` | Hover border (`#226bf1`) |
| `--input/border/focus` | Focus border (`#1072ea`) |
| `--input/border/error` | Error border (`#eb3a2d`) |
| `--input/border/disabled` | Disabled border (`#eceaea`) |
| `--input/background/default` | Field background |
| `--input/background/disabled` | Disabled background |
| `--input/foreground/placeholder` | Placeholder text |
| `--input/foreground/label` | Label text |
| `--input/foreground/helper` | Helper text |
| `--input/foreground/error` | Error message text |
| `--input/radius/sm·md·lg·xl` | Per-size border-radius |

### Example

```tsx
// Figma: Size=XL, State=Default, showLabel=true, showHelperText=true
<Input
  size="xl"
  label="Email"
  placeholder="you@example.com"
  helperText="We'll never share your email."
/>

// Figma: Size=MD, State=Error, showLabel=true, showHelperText=true
<Input
  size="md"
  label="Password"
  placeholder="••••••••"
  error="This field is required"
/>

// Figma: Size=SM, State=Disabled, showLabel=false, showHelperText=false
<Input size="sm" placeholder="Search…" disabled />
```

---

## Checkbox

**Import:** `import { Checkbox } from '@monorepo/ui-kit'`

Maps to the Figma component set at node `1:11892` (layer name **"Checkbox"**). Use for boolean opt-in/opt-out choices. Do not use for mutually exclusive options — use a radio group instead.

### When to use

- Figma layer named `Checkbox`
- Variant property **Size** = `SM` / `MD` / `LG`
- Variant property **State** = `Unchecked` / `Checked` / `Hover` / `Focus` / `Disabled`
- Optional text label to the right of the box

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls box dimensions, border-radius, and checkmark scale. Maps to Figma **Size** variant. |
| `label` | `string` | — | Text rendered to the right of the box via `Typography variant="label"`. Absent in Figma when no label layer is present. |
| `checked` | `boolean` | — | Controlled checked state. Maps to Figma **State** = `Checked`. Native HTML attribute. |
| `defaultChecked` | `boolean` | — | Uncontrolled initial checked state. Native HTML attribute. |
| `disabled` | `boolean` | `false` | Mirrors Figma **State** = `Disabled` (50% opacity). Native HTML attribute. |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | — | Change handler. Native HTML attribute. |
| `id` | `string` | — | Associates an external `<label>` if needed. |

### Size mapping

| Figma Size | `size` | Box dimensions | Border-radius | Checkmark stroke |
|---|---|---|---|---|
| `SM` | `'sm'` | 16 × 16 px | 5 px | 1.5 px |
| `MD` | `'md'` | 20 × 20 px | 6 px | 1.75 px |
| `LG` | `'lg'` | 24 × 24 px | 7 px | 2 px |

### State mapping

Figma **State** is not a prop — it is driven by native HTML behaviour and controlled props.

| Figma State | How to produce it |
|---|---|
| `Unchecked` | no `checked` / `defaultChecked` |
| `Checked` | `checked` or `defaultChecked` |
| `Hover` | CSS `:hover` (automatic) |
| `Focus` | CSS `:focus-visible` (automatic) |
| `Disabled` | `disabled` |

### Design tokens referenced

| Token | Role |
|---|---|
| `--checkbox/background/default` | Unchecked fill |
| `--checkbox/background/checked` | Checked fill (`#1072ea`) |
| `--checkbox/border/default` | Unchecked border (`#c2c1cd`) |
| `--checkbox/border/hover` | Hover border (`#1072ea`) |
| `--checkbox/border/checked` | Checked border (`#1072ea`) |
| `--checkbox/border-width/default` | Unchecked border width (1.5 px) |
| `--checkbox/border-width/checked` | Checked border width (1 px) |
| `--checkbox/radius/sm·md·lg` | Per-size border-radius |
| `--checkbox/size/sm·md·lg` | Per-size box dimensions |
| `--checkbox-checkmark` | Checkmark stroke color |
| `--accents/brand` | Focus ring color |

### Example

```tsx
// Figma: Size=MD, State=Unchecked, no label
<Checkbox size="md" onChange={handleChange} />

// Figma: Size=MD, State=Checked, label visible
<Checkbox size="md" label="Remember me" defaultChecked />

// Figma: Size=LG, State=Disabled
<Checkbox size="lg" label="Notifications" disabled />
```

---

## Button

**Import:** `import { Button } from '@monorepo/ui-kit'`

Maps to the Figma component set at node `1:10688` (frame name **"Button"**). Use for all clickable actions. For a segmented filter/switcher control, use `ButtonGroup` instead.

### When to use

- Figma layer name matches a Button symbol
- Variant property **Variant** = `Primary` / `Secondary` / `Link`
- Variant property **Size** = `SM` / `MD` / `LG` / `XL`
- Variant property **Icon** = `True` → icon-only square button (no label)
- Variant property **State** = `Default` / `Hover` / `Active` / `Focus` / `Disabled`

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'link'` | `'primary'` | Visual style. Maps to Figma **Variant** property. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'xl'` | Controls height, padding, border-radius, and font size. Maps to Figma **Size** property. |
| `leftIcon` | `ReactNode` | — | Icon rendered before the label. When used without `children`, produces an icon-only square button (Figma **Icon=True**). |
| `rightIcon` | `ReactNode` | — | Icon rendered after the label. |
| `children` | `ReactNode` | — | Button label. Omit (with `leftIcon` only) for icon-only mode. |
| `disabled` | `boolean` | `false` | Mirrors Figma **State=Disabled**. Native HTML attribute. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Prevents accidental form submission. |

### Variant mapping

| Figma Variant | `variant` | Description |
|---|---|---|
| `Primary` | `'primary'` | Brand-filled button. Main call to action. |
| `Secondary` | `'secondary'` | Muted background. Secondary actions. |
| `Link` | `'link'` | No background or border. Inline or low-emphasis actions. |

> **Note:** Figma also contains `Bordered`, `Clear`, and `Ghost` variants — these are not yet implemented in the component.

### Size mapping

| Figma Size | `size` | Height | Icon-only dimensions |
|---|---|---|---|
| `SM` | `'sm'` | 32 px | 32 × 32 px |
| `MD` | `'md'` | 40 px | 40 × 40 px |
| `LG` | `'lg'` | 48 px | 48 × 48 px |
| `XL` | `'xl'` | 56 px | 56 × 56 px |

### State mapping

Figma **State** is not a prop — driven by native HTML behaviour and `disabled`.

| Figma State | How to produce it |
|---|---|
| `Default` | no extra props |
| `Hover` | CSS `:hover` (automatic) |
| `Active` | CSS `:active` (automatic) |
| `Focus` | CSS `:focus-visible` (automatic) |
| `Disabled` | `disabled` |

### Example

```tsx
// Figma: Variant=Primary, Size=XL, Icon=False, State=Default
<Button variant="primary" size="xl">Publish</Button>

// Figma: Variant=Secondary, Size=MD, Icon=False, State=Default
<Button variant="secondary" size="md">Cancel</Button>

// Figma: Variant=Primary, Size=MD, Icon=True, State=Default (icon-only)
<Button variant="primary" size="md" leftIcon={<SomeIcon />} />

// Figma: Variant=Primary, Size=LG, Icon=False, State=Disabled
<Button variant="primary" size="lg" disabled>Save</Button>

// Figma: Variant=Link, Size=SM, Icon=False, State=Default
<Button variant="link" size="sm">Learn more</Button>
```

---

## ButtonGroup / ButtonGroupItem

**Import:** `import { ButtonGroup, ButtonGroupItem } from '@monorepo/ui-kit'`

Maps to the Figma component set at node `1:11314` (layer name **"ButtonGroup"**). A segmented control — a bordered container of adjacent cells separated by 1 px dividers. Use for switching between views or filters. Do not use for primary actions — use `Button` instead.

`ButtonGroup` is the container; `ButtonGroupItem` is each individual cell.

### When to use

- Figma layer named `ButtonGroup`
- Figma showcase variant **"Vertical"** → `orientation="vertical"`
- Figma showcase variant **"With Active"** → one item has an active/selected state
- Figma showcase variant **"With Icons"** → items use `icon` prop (square, icon-only cells)
- Figma showcase variant **"Size SM"** / **"Size LG"** → `size` prop

### ButtonGroup props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Applied to all items. Controls cell height and padding. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Figma **"Vertical"** variant → `'vertical'`. |
| `interactive` | `boolean` | `false` | Enables radio-style selection — clicking an item selects it and deselects others. Sets `role="radiogroup"` on the container. |
| `value` | `string` | — | Controlled selected item value. Only active when `interactive` is true. |
| `defaultValue` | `string` | — | Uncontrolled initial selected value. Only active when `interactive` is true. |
| `onChange` | `(value: string) => void` | — | Fires when selection changes. Only active when `interactive` is true. |
| `children` | `ReactNode` | — | **Required.** Should be `ButtonGroupItem` elements. |

### ButtonGroupItem props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | — | Required when parent `ButtonGroup` has `interactive`. Identifies this item for selection. |
| `active` | `boolean` | `false` | Manually marks this item as selected. In non-interactive groups, controlled externally. In interactive groups, managed by the parent. Maps to Figma **"With Active"** variant cell. |
| `icon` | `boolean` | `false` | Icon-only mode — renders as a square cell. Maps to Figma **"With Icons"** variant. |
| `children` | `ReactNode` | — | Label text or icon element. |

### Size mapping

| Figma variant | `size` | Cell height | Text style | Padding x |
|---|---|---|---|---|
| `Size SM` | `'sm'` | 32 px | `Label/SM` (12 px) | 12 px |
| `Default` / `With Active` | `'md'` | 40 px | `Label/MD` (14 px) | 16 px |
| `Size LG` | `'lg'` | 48 px | `Label/MD` (14 px) | 20 px |

### Design tokens referenced

| Token | Role |
|---|---|
| `--border/default` | Outer border and divider color (`#eceaea`) |
| `--border-width/default` | Outer border width (1 px) |
| `--radius/lg` | Outer container corner radius (12 px) |
| `--button/bordered/foreground/default` | Default item label color (`#0f0f10`) |
| `--button/primary/foreground/default` | Active item label color (`white`) |
| `--accents/brand` | Active item background (`#1072ea`) |
| `--button/padding-x/sm·md·lg` | Per-size horizontal cell padding |
| `--button/padding-y/sm·md·lg` | Per-size vertical cell padding |
| `--button/gap` | Icon + label gap inside a cell (8 px) |

### Example

```tsx
// Figma: Default (3 items, MD size, horizontal, no active)
<ButtonGroup size="md">
  <ButtonGroupItem>Day</ButtonGroupItem>
  <ButtonGroupItem>Week</ButtonGroupItem>
  <ButtonGroupItem>Month</ButtonGroupItem>
</ButtonGroup>

// Figma: With Active — second item selected
<ButtonGroup size="md" interactive defaultValue="week">
  <ButtonGroupItem value="day">Day</ButtonGroupItem>
  <ButtonGroupItem value="week">Week</ButtonGroupItem>
  <ButtonGroupItem value="month">Month</ButtonGroupItem>
</ButtonGroup>

// Figma: Vertical
<ButtonGroup orientation="vertical">
  <ButtonGroupItem>Top</ButtonGroupItem>
  <ButtonGroupItem>Middle</ButtonGroupItem>
  <ButtonGroupItem>Bottom</ButtonGroupItem>
</ButtonGroup>
```

---

## Typography

**Import:** `import { Typography } from '@monorepo/ui-kit'`

Maps to the Figma type specimen at node `1:13098` (layer name **"_typography-content"**). Use for all text rendering — headings, body copy, labels, captions, and overlines. The component picks a semantic HTML tag automatically per variant; override with `as` when the tag must differ from the default.

### When to use

- Any text layer in Figma — match the layer name (e.g. `H1`, `Body SM`, `Label`) to the `variant` prop
- When a text layer has a specific color token → pass it via `color`

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | see variant table | `'body'` | Maps to Figma layer name. Controls font size, weight, and line-height. |
| `color` | see color table | `'foreground-primary'` | Semantic color token applied to the text. |
| `as` | `ElementType` | per variant | Overrides the rendered HTML tag. Use when semantic requirements differ from the default (e.g. render an `h1` style as `<h2>`). |

### Variant mapping

| Figma layer | `variant` | Size | Weight | Line-height | Default tag |
|---|---|---|---|---|---|
| `Display` | `'display'` | 48 px | Bold 700 | 1.1 | `<p>` |
| `H1` | `'h1'` | 36 px | Bold 700 | 1.15 | `<h1>` |
| `H2` | `'h2'` | 30 px | Bold 700 | 1.2 | `<h2>` |
| `H3` | `'h3'` | 24 px | Bold 700 | 1.25 | `<h3>` |
| `H4` | `'h4'` | 20 px | SemiBold 600 | 1.3 | `<h4>` |
| `H5` | `'h5'` | 18 px | SemiBold 600 | 1.35 | `<h5>` |
| `H6` | `'h6'` | 16 px | SemiBold 600 | 1.4 | `<h6>` |
| `Body LG` | `'bodyLg'` | 18 px | Regular 400 | 1.6 | `<p>` |
| `Body` | `'body'` | 16 px | Regular 400 | 1.6 | `<p>` |
| `Body SM` | `'bodySm'` | 14 px | Regular 400 | 1.5 | `<p>` |
| `Label` | `'label'` | 14 px | Medium 500 | 1.4 | `<span>` |
| `Caption` | `'caption'` | 12 px | Regular 400 | 1.4 | `<span>` |
| `Overline` | `'overline'` | 11 px | SemiBold 600 | 1.4 | `<span>` |

### Color values

| `color` | Token |
|---|---|
| `'foreground-primary'` | `--foreground/primary` |
| `'foreground-secondary'` | `--foreground/secondary` |
| `'foreground-tertiary'` | `--foreground/tertiary` |
| `'foreground-quaternary'` | `--foreground/quaternary` |
| `'foreground-on-accent'` | `--foreground/on-accent` |
| `'accents-brand'` | `--accents/brand` |
| `'accents-danger'` | `--accents/danger` |
| `'accents-success'` | `--accents/success` |
| `'accents-warning'` | `--accents/warning` |
| `'accents-info'` | `--accents/info` |

> Full list of accepted values: see `TypographyColor` in `Typography.types.ts`.

### Example

```tsx
// Figma: layer "H1", color foreground-primary (default)
<Typography variant="h1">Getting Started</Typography>

// Figma: layer "Body SM", color foreground-tertiary
<Typography variant="bodySm" color="foreground-tertiary">
  Last updated 3 minutes ago
</Typography>

// Figma: layer "Label" used inside a form field
<Typography variant="label">Email address</Typography>

// Figma: layer "Caption", error state — color accents-danger
<Typography variant="caption" color="accents-danger">
  This field is required
</Typography>

// Figma: layer "H2" but must render as <h1> (only one h1 on page)
<Typography variant="h2" as="h1">Page Title</Typography>
```

---

## Avatar

**Import:** `import { Avatar } from '@monorepo/ui-kit'`

Maps to the Figma component set at node `1:12442` (layer name **"Avatar"**). A circular container that renders, in priority order: a photo, initials, or a generic fallback icon. The Figma component set shows the initials variant only; image and icon fallback are handled at runtime.

### When to use

- Figma layer named `Avatar`
- Variant property **Size** = `SM` / `MD` / `LG` / `XL`
- Content inside the circle is 2-letter text → pass `name` or `initials`
- Content is a photo → pass `src`
- No content info → fallback icon renders automatically

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Controls circle dimensions and initials text size. Maps to Figma **Size** variant. |
| `src` | `string` | — | Image URL. When provided, fills the circle. Falls back to initials or icon on load error. |
| `name` | `string` | — | Full name used to derive initials (`"Jane Doe"` → `"JD"`) and as the default `aria-label`. |
| `initials` | `string` | — | Explicit 1–2 character override. Takes priority over `name`-derived initials. |
| `alt` | `string` | `name` | Overrides the accessible label. |

### Render priority

1. `src` image (falls back on error)
2. `initials` (explicit) or initials derived from `name`
3. Generic fallback icon (when neither image nor initials are available)

### Size mapping

| Figma Size | `size` | Dimensions | Initials text style |
|---|---|---|---|
| `SM` | `'sm'` | 24 × 24 px | `Label/SM` (12 px medium) |
| `MD` | `'md'` | 40 × 40 px | `Label/MD` (14 px medium) |
| `LG` | `'lg'` | 56 × 56 px | `Label/MD` (14 px medium) |
| `XL` | `'xl'` | 80 × 80 px | `Label/MD` (14 px medium) |

### Design tokens referenced

| Token | Role |
|---|---|
| `--avatar/background` | Circle background (`#eceaea`) |
| `--avatar/foreground` | Initials text color (`#3d3e42`) |
| `--avatar/border` | Circle border color (`#eceaea`) |
| `--avatar/border-width` | Border width (0.5 px) |
| `--avatar/radius` | Border radius (9999 px — fully circular) |
| `--avatar/size/sm·md·lg·xl` | Per-size circle dimensions |

### Example

```tsx
// Figma: Size=MD, initials "AB"
<Avatar size="md" name="Anna Brown" />

// Figma: Size=LG, initials explicit
<Avatar size="lg" initials="JD" />

// Figma: Size=XL, photo
<Avatar size="xl" src="/avatars/user-42.jpg" name="Maria Garcia" />

// Figma: Size=SM, no name/src — fallback icon
<Avatar size="sm" />
```

---

## Badge

**Import:** `import { Badge } from '@monorepo/ui-kit'`

Maps to the Figma component set at node `1:12502` (layer name **"Badge"**). A small pill label used to communicate status, category, or count. Renders as a `<span>` — inline by default.

### When to use

- Figma layer named `Badge`
- Variant property **Variant** = `Primary` / `Secondary` / `Bordered` / `Danger` / `Success` / `Warning`
- Variant property **Size** = `SM` / `MD` / `LG`

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'bordered' \| 'danger' \| 'success' \| 'warning'` | `'primary'` | Visual colour style. Maps to Figma **Variant** property. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Controls horizontal padding. Height is fixed by line-height + vertical padding. Maps to Figma **Size** property. |
| `children` | `ReactNode` | — | Badge label text. |

### Variant mapping

| Figma Variant | `variant` | Background | Foreground |
|---|---|---|---|
| `Primary` | `'primary'` | `--badge/primary/background` (`#1072ea`) | `--badge/primary/foreground` (white) |
| `Secondary` | `'secondary'` | `--badge/secondary/background` (`#f5f5f5`) | `--badge/secondary/foreground` (`#0f0f10`) |
| `Bordered` | `'bordered'` | none | `--badge/bordered/foreground` (`#0f0f10`) |
| `Danger` | `'danger'` | `--badge/danger/background` (`#eb3a2d`) | `--badge/danger/foreground` (white) |
| `Success` | `'success'` | `--badge/success/background` (`#0ebe89`) | `--badge/success/foreground` (white) |
| `Warning` | `'warning'` | `--badge/warning/background` (`#ff8c1a`) | `--badge/warning/foreground` (white) |

### Size mapping

| Figma Size | `size` | Padding x |
|---|---|---|
| `SM` | `'sm'` | 8 px |
| `MD` | `'md'` | 12 px |
| `LG` | `'lg'` | 16 px |

> Vertical padding (`--badge/padding-y`) is 2 px for all sizes. Text style is `Label/SM` (12 px / Medium 500) for all sizes.

### Design tokens referenced

| Token | Role |
|---|---|
| `--badge/primary/background` | Primary fill (`#1072ea`) |
| `--badge/secondary/background` | Secondary fill (`#f5f5f5`) |
| `--badge/danger/background` | Danger fill (`#eb3a2d`) |
| `--badge/success/background` | Success fill (`#0ebe89`) |
| `--badge/warning/background` | Warning fill (`#ff8c1a`) |
| `--badge/bordered/border` | Bordered border color (`#eceaea`) |
| `--badge/bordered/border-width` | Bordered border width (0.5 px) |
| `--badge/radius` | Border radius (9999 px — pill) |
| `--badge/padding-y` | Vertical padding (2 px) |
| `--badge/padding-x/sm·md·lg` | Per-size horizontal padding |

### Example

```tsx
// Figma: Variant=Primary, Size=SM
<Badge variant="primary" size="sm">New</Badge>

// Figma: Variant=Success, Size=MD
<Badge variant="success" size="md">Active</Badge>

// Figma: Variant=Danger, Size=SM
<Badge variant="danger" size="sm">Error</Badge>

// Figma: Variant=Bordered, Size=LG
<Badge variant="bordered" size="lg">Draft</Badge>
```
