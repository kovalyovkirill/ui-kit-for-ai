import { Badge, Checkbox, Typography } from '@monorepo/ui-kit';
import styles from './TaskCard.module.css';

type Priority = 'danger' | 'warning' | 'secondary';

const PRIORITY_LABEL: Record<Priority, string> = {
  danger: 'Высокий',
  warning: 'Средний',
  secondary: 'Низкий',
};

interface TaskCardProps {
  title: string;
  description?: string;
  priority?: Priority;
  date?: string;
  attachments?: string;
  completed?: boolean;
  active?: boolean;
}

export function TaskCard({ title, description, priority, date, attachments, completed = false, active = false }: TaskCardProps) {
  if (completed) {
    return (
      <div className={styles.card}>
        <Checkbox size="sm" defaultChecked />
        <div className={styles.completedContent}>
          <div className={styles.strikethrough}>
            <Typography variant="label" color="foreground-secondary">{title}</Typography>
          </div>
          {description && (
            <Typography variant="bodySm" color="foreground-tertiary">{description}</Typography>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.cardVertical} ${active ? styles.cardActive : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <Checkbox size="sm" />
          {priority && (
            <Badge variant={priority} size="sm">{PRIORITY_LABEL[priority]}</Badge>
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
  );
}
