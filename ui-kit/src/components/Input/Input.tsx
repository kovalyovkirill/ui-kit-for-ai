import clsx from 'clsx'
import { useId } from 'react'

import styles from './Input.module.css'
import { type InputProps } from './Input.types'
import { Typography } from '../Typography/Typography'

export function Input({
  size = 'xl',
  label,
  helperText,
  error,
  disabled,
  id: idProp,
  className,
  ...props
}: InputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  const fieldClasses = clsx(
    styles.field,
    styles[`field-${size}`],
    error && styles['field-error'],
    disabled && styles['field-disabled']
  )

  const inputClasses = clsx(styles.input, styles[`input-${size}`])

  return (
    <div className={clsx(styles.root, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <div className={fieldClasses}>
        <input id={id} className={inputClasses} disabled={disabled} {...props} />
      </div>

      {error ? (
        <Typography variant="caption" color="accents-danger">
          {error}
        </Typography>
      ) : helperText ? (
        <Typography variant="caption" color="foreground-tertiary">
          {helperText}
        </Typography>
      ) : null}
    </div>
  )
}
