import { Button, Typography } from '@monorepo/ui-kit'
import styles from './PageHeader.module.css'

function PlusIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PageHeader() {
  return (
    <div className={styles.hero}>
      <div className={styles.text}>
        <Typography variant="display" as="h1">
          Гляди на главное
        </Typography>
        <Typography variant="body" color="foreground-secondary">
          Осталось 4 задачи на сегодня
        </Typography>
      </div>
      <Button variant="primary" size="md" rightIcon={<PlusIcon />}>
        Добавить задачу
      </Button>
    </div>
  )
}
