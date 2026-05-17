import { type ButtonHTMLAttributes, type ReactNode } from 'react'

/**
 * @figmaValues "Primary" | "Secondary"
 * @values "primary" | "secondary"
 */
export type ButtonVariant = 'primary' | 'secondary'

/**
 * @figmaValues "XL" (design spec) — sm/md/lg derived from token system
 * @values "sm" | "md" | "lg" | "xl"
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button component props
 * @figma https://www.figma.com/design/mCvUF676Ksuw1umEaJiXn7/AI-kit?node-id=1-6908
 * @source Strategy B — parsed from get_design_context reference code (10 nodes)
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @figmaProperty "variant"
   * @figmaType VARIANT
   * @figmaValues "Primary" | "Secondary"
   * @values "primary" | "secondary"
   * @default "primary"
   */
  variant?: ButtonVariant

  /**
   * Button size — controls height, padding, border-radius, and font size
   * @figmaProperty "size"
   * @figmaType VARIANT
   * @figmaValues "XL"
   * @values "sm" | "md" | "lg" | "xl"
   * @default "xl"
   */
  size?: ButtonSize

  /**
   * Icon rendered to the left of the label
   * @figmaProperty "Icon Left"
   * @figmaType INSTANCE_SWAP
   */
  leftIcon?: ReactNode

  /**
   * Icon rendered to the right of the label
   * @figmaProperty "Icon Right"
   * @figmaType INSTANCE_SWAP
   */
  rightIcon?: ReactNode

  // ⚠️ "state" (Default/Hover/Active/Focus) skipped — handled by CSS :hover, :active, :focus-visible
}
