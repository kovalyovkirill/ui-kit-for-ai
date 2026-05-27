import { Button, Typography } from '@monorepo/ui-kit';
import { KanbanColumn } from './KanbanColumn';
import { Navbar } from './Navbar';
import { PerformanceCard } from './PerformanceCard';
import { TaskCard } from './TaskCard';
import styles from './TodoList.module.css';

const PlusIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


export function TodoList() {
  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroText}>
          <Typography variant="h1">Гляди на главное</Typography>
          <Typography variant="body" color="foreground-secondary">Осталось 4 задачи на сегодня</Typography>
        </div>
        <Button variant="primary" size="md" rightIcon={PlusIcon}>Добавить задачу</Button>
      </div>

      <div className={styles.board}>
        <KanbanColumn title="TO DO" count={4}>
          <TaskCard
            priority="danger"
            date="Сегодня"
            title="Финализировать стратегию Q3"
            description="Изучить тренды маркетинга и оценить сроки реализации"
            attachments="2 файла"
          />
          <TaskCard
            priority="warning"
            date="Завтра"
            title="Обновить библиотеку компонентов"
            description="Синхронизировать с командой разработки варианты кнопок"
          />
        </KanbanColumn>

        <KanbanColumn title="В ПРОЦЕССЕ" count={2}>
          <TaskCard
            priority="secondary"
            date="2 часа осталось"
            title="Макеты для клиентской админки"
            active
          />
          <PerformanceCard
            title="Производительность спринта на этой неделе"
            subtitle="Вы на 15% продуктивней чем на прошлой неделе"
            value="88%"
          />
        </KanbanColumn>

        <KanbanColumn
          title="ГОТОВО"
          count={12}
          action={
            <Button variant="link" size="md">Очистить</Button>
          }
        >
          <TaskCard
            title="Синк с бекенд командой"
            description="Обсудить схему API и новые эндпоинты"
            completed
          />
          <TaskCard
            title="Документация по онбордингу"
            description="Загрузить все файлы для портала"
            completed
          />
        </KanbanColumn>
      </div>
    </div>
  );
}
