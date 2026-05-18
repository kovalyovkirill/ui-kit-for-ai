import { Avatar, Button, Input, Typography } from '@monorepo/ui-kit'
import styles from './Navbar.module.css'

export function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.row}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <Typography variant="h4" color="accents-brand">Тудушка</Typography>
          </div>
          <div className={styles.links}>
            <Button variant="link" size="md">Мои задачи</Button>
            <Button variant="link" size="md" className={styles.linkInactive}>Календарь</Button>
            <Button variant="link" size="md" className={styles.linkInactive}>Категории</Button>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.searchWrapper}>
            <Input size="md" placeholder="Поиск" />
          </div>
          <Avatar size="md" initials="КК" />
        </div>
      </div>
      <div className={styles.divider} />
    </header>
  )
}
