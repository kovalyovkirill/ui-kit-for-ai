import { type ReactNode } from 'react'
import { Typography } from '@monorepo/ui-kit'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
  title: string
  count: number
  children: ReactNode
  rightElement?: ReactNode
}

export function KanbanColumn({ title, count, children, rightElement }: KanbanColumnProps) {
  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Typography variant="caption" color="foreground-secondary" className={styles.columnTitle}>
            {title}
          </Typography>
          <span className={styles.countBadge}>
            <Typography variant="caption" color="foreground-secondary">{count}</Typography>
          </span>
        </div>
        {rightElement}
      </div>
      <div className={styles.cards}>{children}</div>
    </div>
  )
}
