import clsx from 'clsx'
import { useState } from 'react'

import styles from './Avatar.module.css'
import { type AvatarProps, type AvatarSize } from './Avatar.types'

/** Derives up to 2 uppercase initials from a full name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function FallbackIcon({ size }: { size: AvatarSize }) {
  return (
    <svg
      className={clsx(styles.icon, styles[`icon-${size}`])}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8H4z" />
    </svg>
  )
}

export function Avatar({
  size = 'md',
  src,
  alt,
  name,
  initials,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  const displayInitials = initials?.slice(0, 2).toUpperCase() ?? (name ? getInitials(name) : '')
  const showImage = !!src && !imgError
  const showInitials = !showImage && displayInitials.length > 0

  return (
    <div
      role="img"
      aria-label={alt ?? name ?? 'Avatar'}
      className={clsx(styles.root, styles[size], className)}
      {...props}
    >
      {showImage && (
        <img
          src={src}
          alt={alt ?? name ?? ''}
          className={styles.img}
          onError={() => setImgError(true)}
        />
      )}

      {!showImage && showInitials && (
        <span className={clsx(styles.initials, styles[`initials-${size}`])}>{displayInitials}</span>
      )}

      {!showImage && !showInitials && <FallbackIcon size={size} />}
    </div>
  )
}
