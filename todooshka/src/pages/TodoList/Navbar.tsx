import { Avatar, Button, Input, Typography } from '@monorepo/ui-kit';
import styles from './Navbar.module.css';

export function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.navRow}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <Typography variant="h4" color="accents-brand">Тудушка</Typography>
          </div>
          <nav className={styles.links}>
            <Button variant="link" size="md">Мои задачи</Button>
            <div className={styles.ghostLink}>
              <Button variant="link" size="md">Календарь</Button>
            </div>
            <div className={styles.ghostLink}>
              <Button variant="link" size="md">Категории</Button>
            </div>
          </nav>
        </div>
        <div className={styles.navRight}>
          <div className={styles.searchWrapper}>
            <Input size="md" placeholder="Поиск" />
          </div>
          <Avatar size="md" initials="КК" />
        </div>
      </div>
      <div className={styles.divider} />
    </header>
  );
}
