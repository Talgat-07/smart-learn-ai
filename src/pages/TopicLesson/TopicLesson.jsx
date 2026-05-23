import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLearning } from '../../context/LearningContext'
import {
  TOPIC_STATUS,
  getTopicStatusClass,
  getTopicStatusLabel,
} from '../../utils/progress'
import './TopicLesson.scss'

const getAiHint = (topicTitle) =>
  `AI-подсказка: разбейте тему «${topicTitle}» на 2-3 маленьких шага, затем закрепите каждый шаг практикой.`

function TopicLesson() {
  const params = useParams()
  const navigate = useNavigate()
  const {
    learningPlans,
    tasks,
    startTopic,
    completeTopic,
    topicProgress,
    selectDirection,
    selectedDirectionId,
  } = useLearning()

  useEffect(() => {
    if (params.directionId && params.directionId !== selectedDirectionId) {
      selectDirection(params.directionId)
    }
  }, [params.directionId, selectedDirectionId, selectDirection])

  const topics = learningPlans[params.directionId] || []
  const topic = topics.find((item) => item.id === params.topicId)

  if (!topic) {
    return (
      <section className='topic-lesson-empty'>
        <h2>Урок не найден</h2>
        <p>Проверьте выбранное направление или вернитесь к списку тем.</p>
        <Link className='primary-btn' to='/directions'>
          Вернуться к направлениям
        </Link>
      </section>
    )
  }

  const state = topicProgress[topic.id]
  const status = state?.status || TOPIC_STATUS.NOT_STARTED

  const relatedTasks = (Array.isArray(tasks) ? tasks : []).filter(
    (task) => task.topicId === topic.id,
  )

  return (
    <section className='topic-lesson-page'>
      <header className='page-header'>
        <h2 className='page-title'>{topic.title}</h2>
        <p className='page-subtitle'>Подробный материал урока, практика и связанные задания.</p>
      </header>

      <article className='topic-lesson-card surface-card'>
        <div className='topic-lesson-card__meta'>
          <span className={`badge ${getTopicStatusClass(status)}`}>
            {getTopicStatusLabel(status)}
          </span>
          <small>Тема #{topic.order}</small>
        </div>

        <p>{topic.description}</p>

        <h3>Теория</h3>
        <p>{topic.theory}</p>

        <h3>Практические задачи</h3>
        <ul>
          {(Array.isArray(topic.tasks) ? topic.tasks : []).map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>

        <blockquote>{getAiHint(topic.title)}</blockquote>

        <div className='topic-lesson-card__actions'>
          <button
            type='button'
            className='secondary-btn'
            onClick={() => startTopic(topic.id)}
            disabled={status === TOPIC_STATUS.COMPLETED}
          >
            {status === TOPIC_STATUS.IN_PROGRESS ? 'Продолжить урок' : 'Начать урок'}
          </button>

          <button
            type='button'
            className='primary-btn'
            onClick={() => completeTopic(topic.id)}
            disabled={status === TOPIC_STATUS.COMPLETED}
          >
            Завершить урок
          </button>

          <button
            type='button'
            className='ghost-btn'
            onClick={() => navigate(`/plan/${params.directionId}`)}
          >
            Назад к плану
          </button>
        </div>
      </article>

      <article className='topic-lesson-related surface-card'>
        <h3>Связанные задания</h3>
        {relatedTasks.length === 0 ? (
          <p>По этой теме пока нет отдельных заданий.</p>
        ) : (
          <ul>
            {relatedTasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.description}</span>
                <button
                  type='button'
                  className='ghost-btn'
                  onClick={() => navigate(`/tasks?topic=${topic.id}`)}
                >
                  Открыть задания
                </button>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}

export default TopicLesson
