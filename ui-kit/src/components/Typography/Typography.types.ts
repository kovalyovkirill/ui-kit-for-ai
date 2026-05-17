import { type ElementType, type HTMLAttributes } from 'react'

/**
 * @figma https://www.figma.com/design/mCvUF676Ksuw1umEaJiXn7/AI-kit?node-id=1-13098
 * @source Strategy B — parsed from get_design_context reference code
 *
 * Variants from Figma:
 * display  — 48px / Bold 700 / lh 1.1
 * h1       — 36px / Bold 700 / lh 1.15
 * h2       — 30px / Bold 700 / lh 1.2
 * h3       — 24px / Bold 700 / lh 1.25
 * h4       — 20px / SemiBold 600 / lh 1.3
 * h5       — 18px / SemiBold 600 / lh 1.35
 * h6       — 16px / SemiBold 600 / lh 1.4
 * bodyLg   — 18px / Regular 400 / lh 1.6
 * body     — 16px / Regular 400 / lh 1.6
 * bodySm   — 14px / Regular 400 / lh 1.5
 * label    — 14px / Medium 500  / lh 1.4
 * caption  — 12px / Regular 400 / lh 1.4
 * overline — 11px / SemiBold 600 / lh 1.4 / uppercase
 */
export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'label'
  | 'caption'
  | 'overline'

export type TypographyColor =
  | 'foreground-primary'
  | 'foreground-secondary'
  | 'foreground-tertiary'
  | 'foreground-quaternary'
  | 'foreground-on-accent'
  | 'neutrals-background'
  | 'neutrals-surface'
  | 'neutrals-subtle'
  | 'neutrals-muted'
  | 'neutrals-emphasis'
  | 'border-default'
  | 'border-strong'
  | 'accents-brand'
  | 'accents-success'
  | 'accents-info'
  | 'accents-danger'
  | 'accents-warning'
  | 'tint-brand'
  | 'tint-danger'
  | 'tint-success'
  | 'tint-info'
  | 'tint-warning'
  | 'interactive-brand-default'
  | 'interactive-brand-hover'
  | 'interactive-brand-active'
  | 'interactive-brand-disabled'
  | 'interactive-danger-default'
  | 'interactive-danger-hover'
  | 'interactive-danger-active'
  | 'interactive-danger-disabled'
  | 'interactive-secondary-default'
  | 'interactive-secondary-hover'
  | 'interactive-secondary-active'
  | 'interactive-secondary-disabled'
  | 'focus-ring-brand'
  | 'focus-ring-danger'
  | 'focus-ring-neutral'

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /**
   * Visual text style
   * @figmaProperty "variant"
   * @figmaType VARIANT
   * @default "body"
   */
  variant?: TypographyVariant

  /**
   * Text color — maps to a semantic design token.
   * @default "foreground-primary"
   */
  color?: TypographyColor

  /**
   * Override the rendered HTML element.
   * Defaults to a sensible semantic tag per variant.
   */
  as?: ElementType
}
