import { Typography } from '@monorepo/ui-kit'
import styles from './PerformanceCard.module.css'

interface PerformanceCardProps {
  title: string
  subtitle: string
  stat: string
}

export default function PerformanceCard({ title, subtitle, stat }: PerformanceCardProps) {
  return (
    <div className={styles.card}>
      <Typography variant="h6" color="foreground-on-accent">{title}</Typography>
      <Typography variant="bodySm" color="foreground-on-accent">{subtitle}</Typography>
      <Typography variant="display" color="foreground-on-accent" className={styles.stat}>
        {stat}
      </Typography>
    </div>
  )
}
