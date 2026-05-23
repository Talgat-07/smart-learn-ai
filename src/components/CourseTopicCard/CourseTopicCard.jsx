import './CourseTopicCard.scss'

function CourseTopicCard({
  topic,
  statusLabel,
  statusClass,
  onStart,
  onComplete,
  onOpenLesson,
  onOpenTasks,
  isDone,
  isInProgress,
}) {
  if (!topic || typeof topic !== 'object') {
    return null
  }

  const startButtonLabel = isInProgress ? 'Продолжить' : 'Начать урок'

  return (
    <article className='topic-card'>
      <div className='topic-card__top'>
        <h3>{topic.title}</h3>
        <span className={`badge ${statusClass}`}>{statusLabel}</span>
      </div>

      <p className='topic-card__description'>{topic.description}</p>

      <ul className='topic-card__tasks'>
        {(Array.isArray(topic.tasks) ? topic.tasks : []).map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>

      <div className='topic-card__actions'>
        <button type='button' className='secondary-btn' onClick={onStart} disabled={isDone}>
          {startButtonLabel}
        </button>

        <button type='button' className='primary-btn' onClick={onComplete} disabled={isDone}>
          Отметить выполненным
        </button>

        <button type='button' className='ghost-btn' onClick={onOpenLesson}>
          Открыть урок
        </button>

        <button type='button' className='ghost-btn' onClick={onOpenTasks}>
          Открыть задания
        </button>
      </div>
    </article>
  )
}

export default CourseTopicCard
