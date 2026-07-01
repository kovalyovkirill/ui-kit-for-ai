import { Button } from '@monorepo/ui-kit'
import { Navbar } from './Navbar'
import { PageHeader } from './PageHeader'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { PerformanceCard } from './PerformanceCard'
import { DoneCard } from './DoneCard'
import styles from './TodoList.module.css'

export function TodoList() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <PageHeader />
        <div className={styles.board}>
          <KanbanColumn title="TO DO" count={4}>
            <TaskCard
              priority={{ label: 'Высокий', variant: 'danger' }}
              due="Сегодня"
              title="Финализировать стратегию Q3"
              description="Изучить тренды маркетинга и оценить сроки реализации"
              meta="2 файла"
            />
            <TaskCard
              priority={{ label: 'Средний', variant: 'warning' }}
              due="Завтра"
              title="Обновить библиотеку компонентов"
              description="Синхронизировать с командой разработки варианты кнопок"
            />
          </KanbanColumn>
          <KanbanColumn title="В ПРОЦЕССЕ" count={2}>
            <TaskCard
              priority={{ label: 'Низкий', variant: 'secondary' }}
              due="2 часа осталось"
              title="Макеты для клиентской админки"
              active
              withCheckbox={false}
            />
            <PerformanceCard />
          </KanbanColumn>
          <KanbanColumn
            title="ГОТОВО"
            count={12}
            action={
              <Button variant="link" size="sm">
                Очистить
              </Button>
            }
          >
            <DoneCard
              title="Синк с бекенд командой"
              description="Обсудить схему API и новые эндпоинты"
            />
            <DoneCard
              title="Документация по онбордингу"
              description="Загрузить все файлы для портала"
            />
          </KanbanColumn>
        </div>
      </main>
    </div>
  )
}
