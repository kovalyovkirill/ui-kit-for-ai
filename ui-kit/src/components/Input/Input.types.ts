import { type InputHTMLAttributes } from 'react'

/**
 * @figma https://www.figma.com/design/mCvUF676Ksuw1umEaJiXn7/AI-kit?node-id=1-12018
 *
 * Sizes from Figma:
 * sm — h:32px / body-xs  / radius-sm (8px)
 * md — h:40px / body-sm  / radius-md (12px)
 * lg — h:48px / body-md  / radius-lg (12px)
 * xl — h:56px / body-md  / radius-xl (16px)  ← default
 *
 * States: Default · Hover · Focus · Error · Disabled
 */
export type InputSize = 'sm' | 'md' | 'lg' | 'xl'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Field size — controls height, padding, border-radius and text size.
   * @default "xl"
   */
  size?: InputSize

  /**
   * Label rendered above the field. If provided, it is associated with the
   * input via a generated or explicit `id`.
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
