import { Typography } from '@monorepo/ui-kit'
import styles from './PerformanceCard.module.css'

export function PerformanceCard() {
  return (
    <div className={styles.card}>
      <Typography variant="body" color="foreground-on-accent" className={styles.title}>
        Производительность спринта на этой неделе
      </Typography>
      <Typography variant="bodySm" color="foreground-on-accent">
        Вы на 15% продуктивней чем на прошлой неделе
      </Typography>
      <Typography variant="display" color="foreground-on-accent">88%</Typography>
    </div>
  )
}
