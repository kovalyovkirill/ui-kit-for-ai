/**
 * Machine-readable map for LLM-driven page generation.
 * Single source of truth: Figma layer names → component imports + prop values.
 *
 * TOKEN RULE: Figma MCP outputs slash-separated tokens — replace every / with -
 * e.g. var(--neutrals/surface) → var(--neutrals-surface)
 */

import { type AvatarSize } from './components/Avatar/Avatar.types'
import { type BadgeVariant, type BadgeSize } from './components/Badge/Badge.types'
import { type ButtonVariant, type ButtonSize } from './components/Button/Button.types'
import {
  type ButtonGroupSize,
  type ButtonGroupOrientation,
} from './components/ButtonGroup/ButtonGroup.types'
import { type CheckboxSize } from './components/Checkbox/Checkbox.types'
import { type InputSize } from './components/Input/Input.types'
import {
  type TypographyVariant,
  type TypographyColor,
} from './components/Typography/Typography.types'

type FigmaVariantMap<T extends string> = Record<string, T>

export const AI_MAP = {
  Button: {
    import: '@monorepo/ui-kit',
    figmaLayer: 'Button',
    figmaNodeId: '1:10688',
    variants: {
      Variant: {
        Primary: 'primary',
        Secondary: 'secondary',
        Link: 'link',
      } satisfies FigmaVariantMap<ButtonVariant>,
      Size: {
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
        XL: 'xl',
      } satisfies FigmaVariantMap<ButtonSize>,
    },
    stateProps: { Disabled: 'disabled' },
    notes:
      'Icon-only mode: use leftIcon without children. Bordered/Clear/Ghost variants not yet implemented.',
  },

  Input: {
    import: '@monorepo/ui-kit',
    figmaLayer: 'Input',
    figmaNodeId: '1:12018',
    variants: {
      Size: {
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
        XL: 'xl',
      } satisfies FigmaVariantMap<InputSize>,
    },
    stateProps: { Disabled: 'disabled' },
    errorProp: 'error',
    notes: 'State=Error → error="message". State=Disabled → disabled. Hover/Focus are CSS-only.',
  },

  Checkbox: {
    import: '@monorepo/ui-kit',
    figmaLayer: 'Checkbox',
    figmaNodeId: '1:11892',
    variants: {
      Size: {
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
      } satisfies FigmaVariantMap<CheckboxSize>,
    },
    stateProps: { Checked: 'checked', Disabled: 'disabled' },
    notes: 'Uncontrolled initial state: defaultChecked. Label renders to the right of the box.',
  },

  Avatar: {
    import: '@monorepo/ui-kit',
    figmaLayer: 'Avatar',
    figmaNodeId: '1:12442',
    variants: {
      Size: {
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
        XL: 'xl',
      } satisfies FigmaVariantMap<AvatarSize>,
    },
    notes: 'Render priority: src → initials (explicit) → initials from name → fallback icon.',
  },

  Badge: {
    import: '@monorepo/ui-kit',
    figmaLayer: 'Badge',
    figmaNodeId: '1:12502',
    variants: {
      Variant: {
        Primary: 'primary',
        Secondary: 'secondary',
        Bordered: 'bordered',
        Danger: 'danger',
        Success: 'success',
        Warning: 'warning',
      } satisfies FigmaVariantMap<BadgeVariant>,
      Size: {
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
      } satisfies FigmaVariantMap<BadgeSize>,
    },
  },

  ButtonGroup: {
    import: '@monorepo/ui-kit',
    figmaLayer: 'ButtonGroup',
    figmaNodeId: '1:11314',
    variants: {
      Size: {
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
      } satisfies FigmaVariantMap<ButtonGroupSize>,
      Orientation: {
        Horizontal: 'horizontal',
        Vertical: 'vertical',
      } satisfies FigmaVariantMap<ButtonGroupOrientation>,
    },
    notes:
      'Use interactive+value/defaultValue for radio-style selection. Each item needs ButtonGroupItem. Icon-only cells: icon={true}.',
  },

  Typography: {
    import: '@monorepo/ui-kit',
    figmaLayer: '_typography-content',
    figmaNodeId: '1:13098',
    variants: {
      Variant: {
        Display: 'display',
        H1: 'h1',
        H2: 'h2',
        H3: 'h3',
        H4: 'h4',
        H5: 'h5',
        H6: 'h6',
        'Body LG': 'bodyLg',
        Body: 'body',
        'Body SM': 'bodySm',
        Label: 'label',
        Caption: 'caption',
        Overline: 'overline',
      } satisfies FigmaVariantMap<TypographyVariant>,
      Color: {
        'foreground/primary': 'foreground-primary',
        'foreground/secondary': 'foreground-secondary',
        'foreground/tertiary': 'foreground-tertiary',
        'foreground/on-accent': 'foreground-on-accent',
        'accents/brand': 'accents-brand',
        'accents/danger': 'accents-danger',
        'accents/success': 'accents-success',
        'accents/warning': 'accents-warning',
      } satisfies FigmaVariantMap<TypographyColor>,
    },
    notes:
      'Figma layer name = variant. Override rendered tag with as prop when semantic tag must differ from default.',
  },
} as const
