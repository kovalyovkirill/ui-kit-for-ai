import { Button, Typography } from '@monorepo/ui-kit'
import styles from './Hero.module.css'

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2.667v10.666M2.667 8h10.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <Typography variant="h1">Гляди на главное</Typography>
        <Typography variant="body" color="foreground-secondary">Осталось 4 задачи на сегодня</Typography>
      </div>
      <Button variant="primary" size="md" rightIcon={<PlusIcon />}>Добавить задачу</Button>
    </section>
  )
}
