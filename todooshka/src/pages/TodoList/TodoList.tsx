import { Avatar, Button, Input, Typography } from '@monorepo/ui-kit';
import { PerformanceCard } from './PerformanceCard';
import { TaskCard } from './TaskCard';
import styles from './TodoList.module.css';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function TodoList() {
  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.navRow}>
          <div className={styles.navLeft}>
            <Typography variant="h4" color="accents-brand">Тудушка</Typography>
            <nav className={styles.navLinks}>
              <Button variant="link" size="md">Мои задачи</Button>
              <button className={styles.navGhost}>
                <Typography variant="label" color="foreground-secondary">Календарь</Typography>
              </button>
              <button className={styles.navGhost}>
                <Typography variant="label" color="foreground-secondary">Категории</Typography>
              </button>
            </nav>
          </div>
          <div className={styles.navRight}>
            <Input size="md" placeholder="Поиск" />
            <Avatar size="md" initials="КК" />
          </div>
        </div>
        <div className={styles.navDivider} />
      </header>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <Typography variant="h1">Гляди на главное</Typography>
          <Typography variant="body" color="foreground-secondary">Осталось 4 задачи на сегодня</Typography>
        </div>
        <Button variant="primary" size="md" rightIcon={<PlusIcon />}>Добавить задачу</Button>
      </section>

      <div className={styles.kanban}>
        <div className={styles.column}>
          <div className={styles.colHeader}>
            <Typography variant="caption" color="foreground-secondary">TO DO</Typography>
            <div className={styles.countBadge}>
              <Typography variant="caption" color="foreground-secondary">4</Typography>
            </div>
          </div>
          <TaskCard
            priority="high"
            date="Сегодня"
            title="Финализировать стратегию Q3"
            description="Изучить тренды маркетинга и оценить сроки реализации"
            attachments="2 файла"
          />
          <TaskCard
            priority="medium"
            date="Завтра"
            title="Обновить библиотеку компонентов"
            description="Синхронизировать с командой разработки варианты кнопок"
          />
        </div>

        <div className={styles.column}>
          <div className={styles.colHeader}>
            <Typography variant="caption" color="foreground-secondary">В ПРОЦЕССЕ</Typography>
            <div className={styles.countBadge}>
              <Typography variant="caption" color="foreground-secondary">2</Typography>
            </div>
          </div>
          <TaskCard
            active
            priority="low"
            date="2 часа осталось"
            title="Макеты для клиентской админки"
          />
          <PerformanceCard />
        </div>

        <div className={styles.column}>
          <div className={styles.colHeaderWithAction}>
            <div className={styles.colHeaderLeft}>
              <Typography variant="caption" color="foreground-secondary">ГОТОВО</Typography>
              <div className={styles.countBadge}>
                <Typography variant="caption" color="foreground-secondary">12</Typography>
              </div>
            </div>
            <Button variant="link" size="sm">Очистить</Button>
          </div>
          <TaskCard
            completed
            title="Синк с бекенд командой"
            description="Обсудить схему API и новые эндпоинты"
          />
          <TaskCard
            completed
            title="Документация по онбордингу"
            description="Загрузить все файлы для портала"
          />
        </div>
      </div>
    </div>
  );
}
