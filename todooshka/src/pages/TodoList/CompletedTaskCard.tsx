import { Checkbox, Typography } from '@monorepo/ui-kit'
import styles from './CompletedTaskCard.module.css'

interface CompletedTaskCardProps {
  title: string
  description: string
}

export function CompletedTaskCard({ title, description }: CompletedTaskCardProps) {
  return (
    <div className={styles.card}>
      <Checkbox size="sm" defaultChecked />
      <div className={styles.content}>
        <Typography variant="label" color="foreground-secondary" className={styles.title}>{title}</Typography>
        <Typography variant="bodySm" color="foreground-tertiary">{description}</Typography>
      </div>
    </div>
  )
}
