import { Avatar, Badge, Button, Input, Typography } from '@monorepo/ui-kit'
import TaskCard from './TaskCard'
import PerformanceCard from './PerformanceCard'
import styles from './TodoList.module.css'

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2.5 8H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export default function TodoList() {
  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.navRow}>
          <div className={styles.navLeft}>
            <Typography variant="h4" color="accents-brand" as="span">Тудушка</Typography>
            <nav className={styles.navLinks}>
              <Button variant="link" size="md">Мои задачи</Button>
              <Button variant="link" size="md" className={styles.navLinkInactive}>Календарь</Button>
              <Button variant="link" size="md" className={styles.navLinkInactive}>Категории</Button>
            </nav>
          </div>
          <div className={styles.navRight}>
            <Input size="md" placeholder="Поиск" className={styles.searchInput} />
            <Avatar initials="КК" size="md" />
          </div>
        </div>
        <div className={styles.divider} />
      </header>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <Typography variant="h1">Гляди на главное</Typography>
          <Typography variant="body" color="foreground-secondary">Осталось 4 задачи на сегодня</Typography>
        </div>
        <Button variant="primary" size="md" rightIcon={<PlusIcon />}>Добавить задачу</Button>
      </section>

      <main className={styles.board}>
        <div className={styles.col}>
          <div className={styles.colHeader}>
            <div className={styles.colHeaderLeft}>
              <Typography variant="caption" color="foreground-secondary" className={styles.colLabel}>TO DO</Typography>
              <Badge variant="secondary" size="sm">4</Badge>
            </div>
          </div>
          <TaskCard
            showCheckbox
            priority="danger"
            priorityLabel="Высокий"
            date="Сегодня"
            title="Финализировать стратегию Q3"
            description="Изучить тренды маркетинга и оценить сроки реализации"
            attachments="2 файла"
          />
          <TaskCard
            showCheckbox
            priority="warning"
            priorityLabel="Средний"
            date="Завтра"
            title="Обновить библиотеку компонентов"
            description="Синхронизировать с командой разработки варианты кнопок"
          />
        </div>

        <div className={styles.col}>
          <div className={styles.colHeader}>
            <div className={styles.colHeaderLeft}>
              <Typography variant="caption" color="foreground-secondary" className={styles.colLabel}>В ПРОЦЕССЕ</Typography>
              <Badge variant="secondary" size="sm">2</Badge>
            </div>
          </div>
          <TaskCard
            priority="secondary"
            priorityLabel="Низкий"
            date="2 часа осталось"
            title="Макеты для клиентской админки"
            active
          />
          <PerformanceCard
            title="Производительность спринта на этой неделе"
            subtitle="Вы на 15% продуктивней чем на прошлой неделе"
            stat="88%"
          />
        </div>

        <div className={styles.col}>
          <div className={`${styles.colHeader} ${styles.colHeaderSpaceBetween}`}>
            <div className={styles.colHeaderLeft}>
              <Typography variant="caption" color="foreground-secondary" className={styles.colLabel}>ГОТОВО</Typography>
              <Badge variant="secondary" size="sm">12</Badge>
            </div>
            <Button variant="link" size="md">Очистить</Button>
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
      </main>
    </div>
  )
}
