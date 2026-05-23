import { Link } from 'react-router-dom'
import { useLearning } from '../../context/LearningContext'
import './Header.scss'

function Header() {
  const { selectedDirection, studentStats } = useLearning()
  const overallProgress = Number.isFinite(studentStats?.overallProgress)
    ? studentStats.overallProgress
    : 0

  return (
    <header className='app-header'>
      <div>
        <p className='app-header__label'>Система обучения студентов на основе искусственного интеллекта</p>
        <h1 className='app-header__title'>Smart Learn AI</h1>
      </div>
      <div className='app-header__actions'>
        <div className='app-header__direction'>
          <span>Текущее направление:</span>
          <strong>{selectedDirection?.title || 'Не выбрано'}</strong>
          <small>Общий прогресс: {overallProgress}%</small>
        </div>
        <Link className='app-header__button' to='/directions'>
          Изменить направление
        </Link>
      </div>
    </header>
  )
}

export default Header
