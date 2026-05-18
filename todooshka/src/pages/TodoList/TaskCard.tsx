import { Badge, Checkbox, Typography } from '@monorepo/ui-kit';
import styles from './TaskCard.module.css';

type Priority = 'high' | 'medium' | 'low' | 'none';

interface TaskCardProps {
  completed?: boolean;
  active?: boolean;
  priority?: Priority;
  date?: string;
  title: string;
  description?: string;
  attachments?: string;
}

const priorityMap = {
  high: { variant: 'danger' as const, label: 'Высокий' },
  medium: { variant: 'warning' as const, label: 'Средний' },
  low: { variant: 'secondary' as const, label: 'Низкий' },
};

export function TaskCard({ completed, active, priority = 'none', date, title, description, attachments }: TaskCardProps) {
  if (completed) {
    return (
      <div className={`${styles.card} ${styles.cardCompleted}`}>
        <Checkbox size="sm" defaultChecked />
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
    );
  }

  return (
    <div className={`${styles.card} ${styles.cardNormal}${active ? ` ${styles.cardActive}` : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.leftGroup}>
          <Checkbox size="sm" />
          {priority !== 'none' && (
            <Badge variant={priorityMap[priority].variant} size="sm">
              {priorityMap[priority].label}
            </Badge>
          )}
        </div>
        {date && (
          <Typography variant="caption" color="foreground-tertiary">
            {date}
          </Typography>
        )}
      </div>
      <Typography variant="label">{title}</Typography>
      {description && (
        <Typography variant="bodySm" color="foreground-secondary">
          {description}
        </Typography>
      )}
      {attachments && (
        <Typography variant="caption" color="foreground-tertiary">
          {attachments}
        </Typography>
      )}
    </div>
  );
}
