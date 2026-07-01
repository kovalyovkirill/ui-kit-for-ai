---
component: Avatar
import: "@monorepo/ui-kit"
nodeId: "1:12442"
layer: "Avatar"
props:
  size:     { values: [sm, md, lg, xl], default: md, variantProperty: Size }
  src:      { type: string, note: "image URL; falls back to initials or icon on load error" }
  name:     { type: string, note: "full name → derives initials (Jane Doe → JD) and default aria-label" }
  initials: { type: string, note: "explicit 1–2 char override; takes priority over name-derived initials" }
  alt:      { type: string, note: "overrides aria-label; defaults to name" }
---

# Avatar

A circular container that renders, in priority order: photo → initials → fallback icon.

## Render priority

1. `src` image (falls back on error)
2. `initials` (explicit) or initials derived from `name`
3. Generic fallback icon

## Size mapping

| Pixso Size | `size` | Dimensions | Initials text |
|---|---|---|---|
| SM | sm | 24×24 px | Label/SM 12 px |
| MD | md | 40×40 px | Label/MD 14 px |
| LG | lg | 56×56 px | Label/MD 14 px |
| XL | xl | 80×80 px | Label/MD 14 px |

## Design tokens

`--avatar-background` · `--avatar-foreground` · `--avatar-border` · `--avatar-border-width`
`--avatar-radius` · `--avatar-size-sm` · `--avatar-size-md` · `--avatar-size-lg` · `--avatar-size-xl`

## Examples

```tsx
// Size=MD, initials derived from name
<Avatar size="md" name="Anna Brown" />

// Size=LG, explicit initials
<Avatar size="lg" initials="JD" />

// Size=XL, photo
<Avatar size="xl" src="/avatars/user-42.jpg" name="Maria Garcia" />

// Size=SM, no name/src → fallback icon
<Avatar size="sm" />
```
