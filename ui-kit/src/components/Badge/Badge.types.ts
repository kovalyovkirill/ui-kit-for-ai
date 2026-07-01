import { type HTMLAttributes } from 'react'

/**
 * @design https://pixso.net/app/design/dJRiDr4Ixp89b2OcUPanKg?item-id=1:12502
 *
 * Variants from Pixso:
 * primary   — brand bg   / white text
 * secondary — subtle bg  / primary text
 * bordered  — no bg      / primary text / border
 * danger    — danger bg  / white text
 * success   — success bg / white text
 * warning   — warning bg / white text
 *
 * Sizes from Pixso:
 * sm — px: spacing-2  (8px)
 * md — px: spacing-3  (12px)
 * lg — px: spacing-4  (16px)
 * py: spacing-0-5 (2px) for all sizes
 * Text: label-sm (12px / medium 500) for all sizes
 */
export type BadgeVariant = 'primary' | 'secondary' | 'bordered' | 'danger' | 'success' | 'warning'

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual colour variant.
   * @default "primary"
   */
  variant?: BadgeVariant

  /**
   * Badge size — controls horizontal padding only (height is driven by line-height + py).
   * @default "sm"
   */
  size?: BadgeSize
}
