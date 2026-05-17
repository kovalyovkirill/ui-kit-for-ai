import clsx from 'clsx'

import styles from './Badge.module.css'
import { type BadgeProps } from './Badge.types'

export function Badge({
  variant = 'primary',
  size = 'sm',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={clsx(styles.root, styles[variant], styles[size], className)} {...props}>
      {children}
    </span>
  )
}
