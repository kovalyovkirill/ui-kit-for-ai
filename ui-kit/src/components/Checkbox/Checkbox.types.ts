import { type InputHTMLAttributes } from 'react'

/**
 * @design https://pixso.net/app/design/dJRiDr4Ixp89b2OcUPanKg?item-id=1:11892
 *
 * Sizes from Pixso:
 * sm — 16×16px / radius 5px
 * md — 20×20px / radius 6px
 * lg — 24×24px / radius 7px
 *
 * States: Unchecked · Hover · Focus · Checked · Disabled
 */
export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /**
   * Control size — affects box dimensions, border-radius and checkmark scale.
   * @default "md"
   */
  size?: CheckboxSize

  /**
   * Optional label rendered to the right of the box.
   */
  label?: string
}
