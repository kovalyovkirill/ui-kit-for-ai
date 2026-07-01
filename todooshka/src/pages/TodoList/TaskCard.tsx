import { Badge, Checkbox, Typography } from '@monorepo/ui-kit'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  priority: { label: string; variant: 'danger' | 'warning' | 'secondary' }
  due: string
  title: string
  description?: string
  meta?: string
  active?: boolean
  withCheckbox?: boolean
}

export function TaskCard({
  priority,
  due,
  title,
  description,
  meta,
  active,
  withCheckbox = true,
}: TaskCardProps) {
  return (
    <article
      className={active ? `${styles.card} ${styles.active}` : styles.card}
    >
      <div className={styles.header}>
        <div className={styles.headerStart}>
          {withCheckbox && <Checkbox size="sm" />}
          <Badge variant={priority.variant} size="sm">
            {priority.label}
          </Badge>
        </div>
        <Typography variant="caption" color="foreground-tertiary">
          {due}
        </Typography>
      </div>
      <Typography variant="label" color="foreground-primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="bodySm" color="foreground-secondary">
          {description}
        </Typography>
      )}
      {meta && (
        <Typography variant="caption" color="foreground-tertiary">
          {meta}
        </Typography>
      )}
    </article>
  )
}
