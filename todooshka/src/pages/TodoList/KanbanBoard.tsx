import { Button } from '@monorepo/ui-kit'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { CompletedTaskCard } from './CompletedTaskCard'
import { PerformanceCard } from './PerformanceCard'
import styles from './KanbanBoard.module.css'

export function KanbanBoard() {
  return (
    <div className={styles.board}>
      <KanbanColumn title="To Do" count={4}>
        <TaskCard
          priority="danger"
          priorityLabel="Высокий"
          date="Сегодня"
          title="Финализировать стратегию Q3"
          description="Изучить тренды маркетинга и оценить сроки реализации"
          attachments="2 файла"
        />
        <TaskCard
          priority="warning"
          priorityLabel="Средний"
          date="Завтра"
          title="Обновить библиотеку компонентов"
          description="Синхронизировать с командой разработки варианты кнопок"
        />
      </KanbanColumn>

      <KanbanColumn title="В процессе" count={2}>
        <TaskCard
          priority="secondary"
          priorityLabel="Низкий"
          date="2 часа осталось"
          title="Макеты для клиентской админки"
          active
        />
        <PerformanceCard />
      </KanbanColumn>

      <KanbanColumn
        title="Готово"
        count={12}
        rightElement={
          <Button variant="link" size="md">Очистить</Button>
        }
      >
        <CompletedTaskCard
          title="Синк с бекенд командой"
          description="Обсудить схему API и новые эндпоинты"
        />
        <CompletedTaskCard
          title="Документация по онбордингу"
          description="Загрузить все файлы для портала"
        />
      </KanbanColumn>
    </div>
  )
}
