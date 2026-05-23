import {
  TASK_STATUS,
  formatRuDate,
  getTaskStatusClass,
  getTaskStatusLabel,
} from '../../utils/progress'
import './TaskCard.scss'

function TaskCard({
  task,
  directionName,
  topicTitle,
  taskState,
  onStart,
  onAnswerChange,
  onSubmit,
  onComplete,
  error,
}) {
  if (!task || typeof task !== 'object') {
    return null
  }

  const status = taskState?.status || TASK_STATUS.NOT_STARTED
  const statusClass = getTaskStatusClass(status)
  const statusLabel = getTaskStatusLabel(status)

  return (
    <article className='task-card'>
      <div className='task-card__top'>
        <div>
          <h3>{task.title}</h3>
          <p className='task-card__description'>{task.description}</p>
        </div>
        <span className={`badge ${statusClass}`}>{statusLabel}</span>
      </div>

      <ul className='task-card__meta'>
        <li>
          <strong>Направление:</strong> {directionName}
        </li>
        <li>
          <strong>Связанная тема:</strong> {topicTitle}
        </li>
        <li>
          <strong>Сложность:</strong> {task.difficulty}
        </li>
        <li>
          <strong>Дедлайн:</strong> {formatRuDate(task.deadline)}
        </li>
      </ul>

      <label className='task-card__label' htmlFor={`answer-${task.id}`}>
        Ответ студента
      </label>
      <textarea
        id={`answer-${task.id}`}
        className='task-card__answer'
        placeholder='Опишите ваше решение или вставьте ссылку на проект...'
        value={taskState?.answer || ''}
        onChange={(event) => onAnswerChange(task.id, event.target.value)}
      />

      {error ? <p className='task-card__error'>{error}</p> : null}

      <div className='task-card__actions'>
        <button
          type='button'
          className='secondary-btn'
          onClick={() => onStart(task.id)}
          disabled={status !== TASK_STATUS.NOT_STARTED && status !== TASK_STATUS.NEEDS_FIX}
        >
          Начать
        </button>

        <button type='button' className='primary-btn' onClick={() => onSubmit(task.id)}>
          Отправить
        </button>

        <button
          type='button'
          className='ghost-btn'
          onClick={() => onComplete(task.id)}
          disabled={status === TASK_STATUS.COMPLETED}
        >
          Отметить выполненным
        </button>
      </div>

      {taskState?.aiComment ? (
        <div className='task-card__feedback'>
          <strong>AI-проверка:</strong> {taskState.aiComment}
        </div>
      ) : null}

      {typeof taskState?.score === 'number' ? (
        <p className='task-card__grade'>Оценка: {taskState.score} / 100</p>
      ) : null}

      {Array.isArray(taskState?.history) && taskState.history.length > 0 ? (
        <div className='task-card__history'>
          <h4>История отправки</h4>
          <ul>
            {taskState.history
              .slice()
              .reverse()
              .map((item) => (
                <li key={item.id || `${item.date}-${item.score}`}>
                  <strong>{formatRuDate(item.date)}</strong>
                  <span>{getTaskStatusLabel(item.status)}</span>
                  <span>{item.score} / 100</span>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

export default TaskCard
