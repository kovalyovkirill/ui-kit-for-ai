import { type ReactNode } from 'react'
import { Typography } from '@monorepo/ui-kit'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
  title: string
  count: number
  action?: ReactNode
  children: ReactNode
}

export function KanbanColumn({
  title,
  count,
  action,
  children,
}: KanbanColumnProps) {
  return (
    <section className={styles.column}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Typography variant="overline" color="foreground-secondary">
            {title}
          </Typography>
          <span className={styles.count}>
            <Typography variant="overline" color="foreground-secondary">
              {count}
            </Typography>
          </span>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
