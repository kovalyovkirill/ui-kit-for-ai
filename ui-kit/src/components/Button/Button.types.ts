import { type ButtonHTMLAttributes, type ReactNode } from 'react'

/**
 * @designValues "Primary" | "Secondary" | "Link"
 * @values "primary" | "secondary" | "link"
 */
export type ButtonVariant = 'primary' | 'secondary' | 'link'

/**
 * @designValues "XL" (design spec) — sm/md/lg derived from token system
 * @values "sm" | "md" | "lg" | "xl"
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button component props
 * @design https://pixso.net/app/design/dJRiDr4Ixp89b2OcUPanKg?item-id=1:6908
 * @source Strategy B — parsed from get_design_context reference code (10 nodes)
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @designProperty "variant"
   * @designType VARIANT
   * @designValues "Primary" | "Secondary"
   * @values "primary" | "secondary"
   * @default "primary"
   */
  variant?: ButtonVariant

  /**
   * Button size — controls height, padding, border-radius, and font size
   * @designProperty "size"
   * @designType VARIANT
   * @designValues "XL"
   * @values "sm" | "md" | "lg" | "xl"
   * @default "xl"
   */
  size?: ButtonSize

  /**
   * Icon rendered to the left of the label
   * @designProperty "Icon Left"
   * @designType INSTANCE_SWAP
   */
  leftIcon?: ReactNode

  /**
   * Icon rendered to the right of the label
   * @designProperty "Icon Right"
   * @designType INSTANCE_SWAP
   */
  rightIcon?: ReactNode

  // ⚠️ "state" (Default/Hover/Active/Focus) skipped — handled by CSS :hover, :active, :focus-visible
}
