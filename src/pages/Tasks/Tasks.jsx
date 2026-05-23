import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TaskCard from '../../components/TaskCard/TaskCard'
import { useLearning } from '../../context/LearningContext'
import { taskFilterOptions } from '../../utils/progress'
import './Tasks.scss'

function Tasks() {
  const [searchParams] = useSearchParams()
  const topicQuery = searchParams.get('topic') || 'all'

  const {
    tasks,
    directions,
    learningPlans,
    selectedDirectionId,
    taskProgress,
    startTask,
    setTaskAnswer,
    submitTask,
    completeTask,
  } = useLearning()

  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks])
  const safeDirections = useMemo(
    () => (Array.isArray(directions) ? directions : []),
    [directions],
  )
  const safeTaskProgress = useMemo(
    () => (taskProgress && typeof taskProgress === 'object' ? taskProgress : {}),
    [taskProgress],
  )

  const [statusFilter, setStatusFilter] = useState('all')
  const [directionFilter, setDirectionFilter] = useState(selectedDirectionId || 'all')
  const [searchValue, setSearchValue] = useState('')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  const directionMap = useMemo(
    () =>
      Object.fromEntries(
        safeDirections.map((direction) => [direction.id, direction.title]),
      ),
    [safeDirections],
  )

  const topicMap = useMemo(() => {
    const plans = learningPlans && typeof learningPlans === 'object' ? learningPlans : {}

    return Object.fromEntries(
      Object.values(plans)
        .flat()
        .map((topic) => [topic.id, topic.title]),
    )
  }, [learningPlans])

  const isTopicFilterValid = topicQuery === 'all' || Boolean(topicMap[topicQuery])

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return safeTasks.filter((task) => {
      const status = safeTaskProgress[task.id]?.status || 'not_started'

      if (directionFilter !== 'all' && task.directionId !== directionFilter) {
        return false
      }

      if (topicQuery !== 'all' && task.topicId !== topicQuery) {
        return false
      }

      if (statusFilter !== 'all' && status !== statusFilter) {
        return false
      }

      if (normalizedSearch) {
        const text = `${task.title} ${task.description}`.toLowerCase()
        if (!text.includes(normalizedSearch)) {
          return false
        }
      }

      return true
    })
  }, [safeTasks, safeTaskProgress, directionFilter, statusFilter, searchValue, topicQuery])

  const handleStart = (taskId) => {
    const started = startTask(taskId)

    if (started) {
      setNotice('Задание переведено в статус «В процессе».')
    }
  }

  const handleAnswerChange = (taskId, value) => {
    setTaskAnswer(taskId, value)

    setErrors((prev) => {
      if (!prev[taskId]) {
        return prev
      }

      const next = { ...prev }
      delete next[taskId]
      return next
    })
  }

  const handleSubmit = (taskId) => {
    const answer = safeTaskProgress[taskId]?.answer || ''
    const result = submitTask(taskId, answer)

    if (!result.ok) {
      setErrors((prev) => ({
        ...prev,
        [taskId]: result.error,
      }))
      return
    }

    setErrors((prev) => {
      if (!prev[taskId]) {
        return prev
      }

      const next = { ...prev }
      delete next[taskId]
      return next
    })

    setNotice('Ответ отправлен. AI-проверка завершена, статус задания обновлен.')
  }

  const handleComplete = (taskId) => {
    const completed = completeTask(taskId)

    if (completed) {
      setNotice('Задание отмечено как выполненное.')
    }
  }

  return (
    <section className='tasks-page'>
      <header className='page-header'>
        <h2 className='page-title'>Задания</h2>
        <p className='page-subtitle'>Выполняйте практику, отправляйте решения и получайте AI-комментарии.</p>
      </header>

      <div className='tasks-filter surface-card'>
        <label htmlFor='tasks-direction'>Направление</label>
        <select
          id='tasks-direction'
          value={directionFilter}
          onChange={(event) => setDirectionFilter(event.target.value)}
        >
          <option value='all'>Все направления</option>
          {safeDirections.map((direction) => (
            <option key={direction.id} value={direction.id}>
              {direction.title}
            </option>
          ))}
        </select>

        <label htmlFor='tasks-status'>Статус</label>
        <select
          id='tasks-status'
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          {taskFilterOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor='tasks-search'>Поиск</label>
        <input
          id='tasks-search'
          type='search'
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder='Введите название задания...'
        />
        {searchValue ? (
          <button type='button' className='ghost-btn' onClick={() => setSearchValue('')}>
            Очистить поиск
          </button>
        ) : null}
      </div>

      {notice ? <p className='tasks-notice'>{notice}</p> : null}

      {!isTopicFilterValid ? (
        <article className='tasks-empty surface-card'>
          <h3>Тема не найдена</h3>
          <p>Откройте план обучения и перейдите к заданиям из существующей темы.</p>
        </article>
      ) : null}

      {isTopicFilterValid && filteredTasks.length === 0 ? (
        <article className='tasks-empty surface-card'>
          <h3>Задания не найдены</h3>
          <p>Измените фильтр или строку поиска, чтобы увидеть доступные задания.</p>
        </article>
      ) : null}

      {isTopicFilterValid && filteredTasks.length > 0 ? (
        <div className='tasks-list'>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              directionName={directionMap[task.directionId] || task.directionId}
              topicTitle={topicMap[task.topicId] || 'Тема не указана'}
              taskState={safeTaskProgress[task.id]}
              onStart={handleStart}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmit}
              onComplete={handleComplete}
              error={errors[task.id]}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default Tasks
