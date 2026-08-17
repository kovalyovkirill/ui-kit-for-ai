import clsx from 'clsx'
import { useId } from 'react'

import styles from './Textarea.module.css'
import { type TextareaProps } from './Textarea.types'
import { Typography } from '../Typography/Typography'

export function Textarea({
  size = 'xl',
  label,
  helperText,
  error,
  disabled,
  id: idProp,
  className,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  const fieldClasses = clsx(
    styles.field,
    styles[`field-${size}`],
    error && styles['field-error'],
    disabled && styles['field-disabled']
  )

  const textareaClasses = clsx(styles.textarea, styles[`textarea-${size}`])

  return (
    <div className={clsx(styles.root, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <div className={fieldClasses}>
        <textarea id={id} className={textareaClasses} disabled={disabled} {...props} />
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
