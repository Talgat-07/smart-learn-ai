import { useState } from 'react'
import ProgressCard from '../../components/ProgressCard/ProgressCard'
import { useLearning } from '../../context/LearningContext'
import { formatRuDate } from '../../utils/progress'
import './Profile.scss'

function Profile() {
  const { studentStats, activities, resetProgress } = useLearning()
  const [notice, setNotice] = useState('')
  const stats = studentStats || {}
  const safeActivities = Array.isArray(activities) ? activities : []

  const handleReset = () => {
    const confirmed = window.confirm('Сбросить весь прогресс, задания, календарь и чат AI?')

    if (!confirmed) {
      return
    }

    resetProgress()
    setNotice('Прогресс успешно сброшен.')
  }

  return (
    <section className='profile-page'>
      <header className='page-header'>
        <h2 className='page-title'>Профиль и прогресс студента</h2>
        <p className='page-subtitle'>Здесь отображается реальная статистика обучения, активности и рекомендации AI.</p>
      </header>

      {notice ? <p className='profile-notice'>{notice}</p> : null}

      <article className='profile-main surface-card'>
        <div>
          <h3>{stats.studentName || 'Студент'}</h3>
          <p>
            <strong>Выбранное направление:</strong>{' '}
            {stats.selectedDirection?.title || 'Не выбрано'}
          </p>
        </div>

        <button type='button' className='ghost-btn' onClick={handleReset}>
          Сбросить прогресс
        </button>

        <div className='profile-progress-track'>
          <p>Общий прогресс: {Number.isFinite(stats.overallProgress) ? stats.overallProgress : 0}%</p>
          <div className='progress-track'>
            <span style={{ width: `${Number.isFinite(stats.overallProgress) ? stats.overallProgress : 0}%` }} />
          </div>
        </div>
      </article>

      <div className='profile-metrics'>
        <ProgressCard
          label='Прогресс направления'
          value={`${Number.isFinite(stats.selectedDirectionProgress) ? stats.selectedDirectionProgress : 0}%`}
          description='По выбранной специализации'
        />
        <ProgressCard
          label='Всего тем'
          value={Number.isFinite(stats.totalTopics) ? stats.totalTopics : 0}
          description={`Выполнено ${Number.isFinite(stats.completedTopics) ? stats.completedTopics : 0}`}
        />
        <ProgressCard
          label='Всего заданий'
          value={Number.isFinite(stats.totalTasks) ? stats.totalTasks : 0}
          description={`Выполнено ${Number.isFinite(stats.completedTasks) ? stats.completedTasks : 0}`}
        />
        <ProgressCard
          label='Заданий в процессе'
          value={Number.isFinite(stats.tasksInProgress) ? stats.tasksInProgress : 0}
          description='Активные и отправленные задания'
        />
        <ProgressCard
          label='Просроченных'
          value={Number.isFinite(stats.overdueTasks) ? stats.overdueTasks : 0}
          description='С дедлайном в прошлом'
        />
        <ProgressCard
          label='Средняя оценка'
          value={stats.averageScore ? `${stats.averageScore} / 100` : 'Нет данных'}
          description='Только по заданиям с оценкой'
        />
      </div>

      <article className='profile-recommendation'>
        <h3>Рекомендация от AI</h3>
        <p>{stats.aiRecommendation || 'Рекомендация появится после начала обучения.'}</p>
      </article>

      <article className='profile-activities surface-card'>
        <h3>Последние активности</h3>
        {safeActivities.length === 0 ? (
          <p>Активностей пока нет. Начните с выбора направления и первого урока.</p>
        ) : (
          <ul>
            {safeActivities.slice(0, 10).map((item) => (
              <li key={item.id}>
                <strong>{formatRuDate(item.date)}</strong> · {item.text}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}

export default Profile
