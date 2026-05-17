import clsx from 'clsx'

import styles from './Button.module.css'
import { type ButtonProps } from './Button.types'

export function Button({
  variant = 'primary',
  size = 'xl',
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = clsx(styles.button, styles[variant], styles[size], className)

  return (
    <button className={classes} disabled={disabled} type={type} {...props}>
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  )
}
