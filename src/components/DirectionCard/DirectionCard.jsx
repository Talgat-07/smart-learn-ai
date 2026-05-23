import './DirectionCard.scss'

function DirectionCard({ direction, onViewPlan, isSelected, progress }) {
  if (!direction || typeof direction !== 'object') {
    return null
  }

  const safeProgress = Number.isFinite(progress) ? Math.max(0, progress) : 0
  const hasProgress = safeProgress > 0

  return (
    <article className='direction-card'>
      <div className='direction-card__top'>
        <h3>{direction.title}</h3>
        <span className='badge planned'>{direction.level}</span>
      </div>

      {isSelected ? <span className='badge success'>Выбрано</span> : null}

      <p className='direction-card__description'>{direction.description}</p>

      <ul className='direction-card__meta'>
        <li>
          <strong>Срок:</strong> {direction.duration}
        </li>
        <li>
          <strong>Тем:</strong> {direction.topicsCount}
        </li>
      </ul>

      <div className='direction-card__progress'>
        <p>Прогресс: {safeProgress}%</p>
        <div className='progress-track'>
          <span style={{ width: `${safeProgress}%` }} />
        </div>
      </div>

      <button
        type='button'
        className='primary-btn direction-card__button'
        onClick={() => onViewPlan(direction.id)}
      >
        {isSelected && hasProgress ? 'Продолжить обучение' : 'Смотреть план'}
      </button>
    </article>
  )
}

export default DirectionCard
