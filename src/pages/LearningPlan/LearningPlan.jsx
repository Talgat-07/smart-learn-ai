import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CourseTopicCard from '../../components/CourseTopicCard/CourseTopicCard'
import { useLearning } from '../../context/LearningContext'
import {
  TOPIC_STATUS,
  getTopicStatusClass,
  getTopicStatusLabel,
} from '../../utils/progress'
import './LearningPlan.scss'

function LearningPlan() {
  const params = useParams()
  const navigate = useNavigate()
  const {
    directions,
    learningPlans,
    selectedDirectionId,
    selectDirection,
    topicProgress,
    startTopic,
    completeTopic,
    calculateDirectionProgress,
  } = useLearning()

  const [notice, setNotice] = useState('')
  const activeDirectionId = params.directionId || selectedDirectionId

  useEffect(() => {
    if (params.directionId && params.directionId !== selectedDirectionId) {
      selectDirection(params.directionId)
    }
  }, [params.directionId, selectedDirectionId, selectDirection])

  const safeDirections = Array.isArray(directions) ? directions : []
  const direction = safeDirections.find((item) => item.id === activeDirectionId)

  const topics = useMemo(
    () => (direction ? learningPlans[direction.id] || [] : []),
    [direction, learningPlans],
  )

  if (!direction) {
    return (
      <section className='empty-state'>
        <h2>{activeDirectionId ? 'Направление не найдено' : 'Направление не выбрано'}</h2>
        <p>
          {activeDirectionId
            ? 'Вернитесь в каталог направлений и выберите подходящую специализацию.'
            : 'Сначала выберите IT-направление, чтобы открыть персональный план обучения.'}
        </p>
        <Link className='primary-btn' to='/directions'>
          Перейти к направлениям
        </Link>
      </section>
    )
  }

  const progress = calculateDirectionProgress(direction.id)

  const handleDirectionChange = (event) => {
    const nextDirectionId = event.target.value
    selectDirection(nextDirectionId)
    navigate(`/plan/${nextDirectionId}`)
  }

  const handleStartTopic = (topic) => {
    const didStart = startTopic(topic.id)

    if (didStart) {
      setNotice(`Урок «${topic.title}» начат.`)
      return
    }

    navigate(`/plan/${direction.id}/topic/${topic.id}`)
  }

  const handleCompleteTopic = (topic) => {
    const didComplete = completeTopic(topic.id)

    if (didComplete) {
      setNotice(`Урок «${topic.title}» отмечен как выполненный.`)
    }
  }

  return (
    <section className='learning-plan-page'>
      <header className='page-header'>
        <h2 className='page-title'>План обучения: {direction.title}</h2>
        <p className='page-subtitle'>Проходите уроки по порядку, фиксируйте завершение и переходите к заданиям.</p>
      </header>

      <div className='learning-plan-toolbar surface-card'>
        <label htmlFor='direction-select'>Направление</label>
        <select id='direction-select' value={direction.id} onChange={handleDirectionChange}>
          {safeDirections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <div className='learning-plan-progress'>
          <p>Прогресс по направлению: {progress}%</p>
          <div className='progress-track'>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {notice ? <p className='learning-plan-notice'>{notice}</p> : null}

      {topics.length > 0 ? (
        <div className='learning-plan-topics'>
          {topics.map((topic) => {
            const state = topicProgress[topic.id]
            const status = state?.status || TOPIC_STATUS.NOT_STARTED

            return (
              <CourseTopicCard
                key={topic.id}
                topic={topic}
                statusLabel={getTopicStatusLabel(status)}
                statusClass={getTopicStatusClass(status)}
                isDone={status === TOPIC_STATUS.COMPLETED}
                isInProgress={status === TOPIC_STATUS.IN_PROGRESS}
                onStart={() => handleStartTopic(topic)}
                onComplete={() => handleCompleteTopic(topic)}
                onOpenLesson={() => navigate(`/plan/${direction.id}/topic/${topic.id}`)}
                onOpenTasks={() => navigate(`/tasks?topic=${topic.id}`)}
              />
            )
          })}
        </div>
      ) : (
        <article className='empty-state'>
          <h2>Темы пока не найдены</h2>
          <p>Для выбранного направления нет доступных уроков.</p>
          <Link className='primary-btn' to='/directions'>
            Выбрать другое направление
          </Link>
        </article>
      )}
    </section>
  )
}

export default LearningPlan
