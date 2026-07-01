import { Avatar, Button, Input, Typography } from '@monorepo/ui-kit'
import styles from './Navbar.module.css'

export function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.start}>
        <Typography variant="h4" as="span" color="accents-brand">
          Тудушка
        </Typography>
        <nav className={styles.links}>
          <Button variant="link" size="md">
            Мои задачи
          </Button>
          <Button variant="link" size="md" className={styles.inactive}>
            Календарь
          </Button>
          <Button variant="link" size="md" className={styles.inactive}>
            Категории
          </Button>
        </nav>
      </div>
      <div className={styles.end}>
        <div className={styles.search}>
          <Input size="md" placeholder="Поиск" />
        </div>
        <Avatar size="md" initials="КК" alt="Кирилл Ковалев" />
      </div>
    </header>
  )
}
