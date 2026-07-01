import { type HTMLAttributes } from 'react'

/**
 * @design https://pixso.net/app/design/dJRiDr4Ixp89b2OcUPanKg?item-id=1:12442
 *
 * Sizes from Pixso:
 * sm — 24×24px  / label-sm text (12px medium)
 * md — 40×40px  / label-md text (14px medium)
 * lg — 56×56px  / label-md text (14px medium)
 * xl — 80×80px  / label-md text (14px medium)
 *
 * Render priority: src image → initials (from `initials` or derived from `name`) → fallback icon
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Avatar size.
   * @default "md"
   */
  size?: AvatarSize

  /**
   * Image URL. When provided the image fills the circle.
   * Falls back to initials/icon on load error.
   */
  src?: string

  /** Alt text for the image. Defaults to `name` when omitted. */
  alt?: string

  /**
   * Full name used to derive initials ("Jane Doe" → "JD") and as
   * the default `alt` for the image.
   */
  name?: string

  /**
   * Explicit initials override (1–2 characters).
   * Takes priority over `name`-derived initials.
   */
  initials?: string
}
