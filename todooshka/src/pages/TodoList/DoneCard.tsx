import { Checkbox, Typography } from '@monorepo/ui-kit'
import styles from './DoneCard.module.css'

interface DoneCardProps {
  title: string
  description: string
}

export function DoneCard({ title, description }: DoneCardProps) {
  return (
    <article className={styles.card}>
      <Checkbox size="sm" defaultChecked />
      <div className={styles.text}>
        <span className={styles.strike}>
          <Typography variant="label" color="foreground-secondary">
            {title}
          </Typography>
        </span>
        <Typography variant="bodySm" color="foreground-tertiary">
          {description}
        </Typography>
      </div>
    </article>
  )
}
