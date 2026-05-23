import { Link } from 'react-router-dom'
import { useLearning } from '../../context/LearningContext'
import './Home.scss'

const advantages = [
  'Индивидуальный план обучения',
  'AI-помощник',
  'Практические задания',
  'Календарь отметок',
  'Отслеживание прогресса',
]

function Home() {
  const { selectedDirection, studentStats } = useLearning()
  const overallProgress = Number.isFinite(studentStats?.overallProgress)
    ? studentStats.overallProgress
    : 0
  const completedTasks = Number.isFinite(studentStats?.completedTasks)
    ? studentStats.completedTasks
    : 0
  const averageScore = Number.isFinite(studentStats?.averageScore)
    ? studentStats.averageScore
    : 0

  return (
    <section className='home-page'>
      <div className='home-hero'>
        <p className='home-hero__eyebrow'>Обучающая платформа для IT-направлений</p>
        <h2>Разработка системы обучения студентов на основе искусственного интеллекта</h2>
        <p>
          Платформа помогает студентам выстроить персональный маршрут, выполнять задания,
          получать рекомендации от AI и контролировать прогресс в одном интерфейсе.
        </p>
        <div className='home-hero__actions'>
          <Link
            className='primary-btn'
            to={selectedDirection ? `/plan/${selectedDirection.id}` : '/directions'}
          >
            {selectedDirection ? 'Продолжить обучение' : 'Начать обучение'}
          </Link>
          <Link className='secondary-btn' to='/directions'>
            Выбрать направление
          </Link>
        </div>
        <div className='home-hero__stats'>
          <article>
            <h4>{overallProgress}%</h4>
            <p>Общий прогресс</p>
          </article>
          <article>
            <h4>{completedTasks}</h4>
            <p>Выполнено заданий</p>
          </article>
          <article>
            <h4>{averageScore || '-'}</h4>
            <p>Средняя оценка</p>
          </article>
        </div>
      </div>

      <div className='home-advantages'>
        <h3>Преимущества платформы</h3>
        <div className='home-advantages__grid'>
          {advantages.map((item) => (
            <article key={item} className='home-advantages__item'>
              <h4>{item}</h4>
              <p>
                Сценарии, данные и логика обучения построены так, чтобы студент видел понятный
                следующий шаг и результат.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Home
