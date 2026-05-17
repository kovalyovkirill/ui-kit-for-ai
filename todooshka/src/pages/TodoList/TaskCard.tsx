import { Badge, Checkbox, Typography } from '@monorepo/ui-kit'
import type { BadgeVariant } from '@monorepo/ui-kit'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  priority?: BadgeVariant
  priorityLabel?: string
  date?: string
  title: string
  description?: string
  attachments?: string
  active?: boolean
  completed?: boolean
  showCheckbox?: boolean
}

export default function TaskCard({
  priority,
  priorityLabel,
  date,
  title,
  description,
  attachments,
  active = false,
  completed = false,
  showCheckbox = false,
}: TaskCardProps) {
  if (completed) {
    return (
      <div className={styles.completedCard}>
        <Checkbox size="sm" defaultChecked readOnly />
        <div className={styles.completedContent}>
          <Typography variant="label" color="foreground-secondary" className={styles.strikethrough}>
            {title}
          </Typography>
          {description && (
            <Typography variant="bodySm" color="foreground-tertiary">
              {description}
            </Typography>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.card} ${active ? styles.active : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          {showCheckbox && <Checkbox size="sm" />}
          {priority && priorityLabel && (
            <Badge variant={priority} size="sm">{priorityLabel}</Badge>
          )}
        </div>
        {date && (
          <Typography variant="caption" color="foreground-tertiary">{date}</Typography>
        )}
      </div>
      <Typography variant="label">{title}</Typography>
      {description && (
        <Typography variant="bodySm" color="foreground-secondary">{description}</Typography>
      )}
      {attachments && (
        <Typography variant="caption" color="foreground-tertiary">{attachments}</Typography>
      )}
    </div>
  )
}
