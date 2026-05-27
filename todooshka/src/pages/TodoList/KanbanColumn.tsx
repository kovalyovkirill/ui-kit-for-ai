import { ReactNode } from 'react';
import { Typography } from '@monorepo/ui-kit';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  title: string;
  count: number;
  action?: ReactNode;
  children: ReactNode;
}

export function KanbanColumn({ title, count, action, children }: KanbanColumnProps) {
  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Typography variant="caption" color="foreground-secondary">{title}</Typography>
          <div className={styles.countBadge}>
            <Typography variant="overline" color="foreground-secondary">{count}</Typography>
          </div>
        </div>
        {action}
      </div>
      <div className={styles.cards}>{children}</div>
    </div>
  );
}
