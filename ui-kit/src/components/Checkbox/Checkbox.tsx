import clsx from 'clsx'
import { type ReactElement } from 'react'

import styles from './Checkbox.module.css'
import { type CheckboxProps, type CheckboxSize } from './Checkbox.types'
import { Typography } from '../Typography/Typography'

// Per-size checkmark SVGs — stroke uses the design token so it adapts to theme.
// Paths and stroke-widths match the design component set exactly.
const CHECKMARKS: Record<CheckboxSize, ReactElement> = {
  sm: (
    <svg
      className={clsx(styles.checkmark, styles['checkmark-sm'])}
      viewBox="0 0 9.5 7.5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0.75 3.75L3.75 6.75L8.75 0.75"
        stroke="var(--checkbox-checkmark)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  md: (
    <svg
      className={clsx(styles.checkmark, styles['checkmark-md'])}
      viewBox="0 0 11.75 9.75"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0.875 4.875L4.875 8.875L10.875 0.875"
        stroke="var(--checkbox-checkmark)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  lg: (
    <svg
      className={clsx(styles.checkmark, styles['checkmark-lg'])}
      viewBox="0 0 14 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 6L6 11L13 1"
        stroke="var(--checkbox-checkmark)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

export function Checkbox({ size = 'md', label, className, id, ...props }: CheckboxProps) {
  return (
    <label className={clsx(styles.root, className)}>
      <input type="checkbox" id={id} className={styles.input} {...props} />
      <span className={clsx(styles.box, styles[`box-${size}`])}>{CHECKMARKS[size]}</span>
      {label && (
        <Typography variant="label" color="foreground-primary">
          {label}
        </Typography>
      )}
    </label>
  )
}
