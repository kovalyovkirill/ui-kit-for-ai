import clsx from 'clsx'
import { type ElementType } from 'react'

import styles from './Typography.module.css'
import { type TypographyProps, type TypographyVariant } from './Typography.types'

const defaultTags: Record<TypographyVariant, ElementType> = {
  display: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  bodyLg: 'p',
  body: 'p',
  bodySm: 'p',
  label: 'span',
  caption: 'span',
  overline: 'span',
}

export function Typography({
  variant = 'body',
  color = 'foreground-primary',
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const Tag = as ?? defaultTags[variant]

  const classes = clsx(styles.root, styles[variant], color && styles[color], className)

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  )
}
