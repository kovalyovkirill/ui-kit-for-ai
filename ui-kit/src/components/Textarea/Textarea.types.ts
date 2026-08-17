import { type TextareaHTMLAttributes } from 'react'

/**
 * @figma https://www.figma.com/design/cyHT0J5EpcxFZsxZqqA9gX/AI-kit--Copy-?node-id=1-12424
 *
 * Sizes from Figma (min-height, not fixed height — the field grows with content):
 * sm —  56px / body-sm / radius-sm (8px)
 * md —  80px / body-sm / radius-lg (12px)
 * lg — 112px / body-md / radius-lg (12px)
 * xl — 144px / body-md / radius-xl (16px)  ← default
 *
 * States: Default · Hover · Focus · Error · Disabled
 */
export type TextareaSize = 'sm' | 'md' | 'lg' | 'xl'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Field size — controls min-height, padding, border-radius and text size.
   * @default "xl"
   */
  size?: TextareaSize

  /**
   * Label rendered above the field. If provided, it is associated with the
   * textarea via a generated or explicit `id`.
   */
  label?: string

  /**
   * Supplementary text rendered below the field in tertiary colour.
   * Hidden when `error` is set.
   */
  helperText?: string

  /**
   * Error message. Puts the field into error state (red border) and
   * replaces helper text with this string in danger colour.
   */
  error?: string
}
