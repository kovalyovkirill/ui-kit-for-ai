import { Badge, Checkbox, Typography } from '@monorepo/ui-kit'
import type { BadgeVariant } from '@monorepo/ui-kit'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  priority: BadgeVariant
  priorityLabel: string
  date: string
  title: string
  description?: string
  attachments?: string
  active?: boolean
}

export function TaskCard({ priority, priorityLabel, date, title, description, attachments, active }: TaskCardProps) {
  return (
    <div className={`${styles.card} ${active ? styles.cardActive : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Checkbox size="sm" />
          <Badge variant={priority} size="sm">{priorityLabel}</Badge>
        </div>
        <Typography variant="caption" color="foreground-tertiary">{date}</Typography>
      </div>
      <Typography variant="label" color="foreground-primary">{title}</Typography>
      {description && (
        <Typography variant="bodySm" color="foreground-secondary" className={styles.description}>
          {description}
        </Typography>
      )}
      {attachments && (
        <Typography variant="caption" color="foreground-tertiary">{attachments}</Typography>
      )}
    </div>
  )
}
