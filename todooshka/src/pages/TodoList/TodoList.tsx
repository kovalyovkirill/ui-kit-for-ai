import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { KanbanBoard } from './KanbanBoard'
import styles from './TodoList.module.css'

export default function TodoList() {
  return (
    <div className={styles.page}>
      <Navbar />
      <Hero />
      <KanbanBoard />
    </div>
  )
}
