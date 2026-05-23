import { useNavigate } from 'react-router-dom'
import DirectionCard from '../../components/DirectionCard/DirectionCard'
import { useLearning } from '../../context/LearningContext'
import './Directions.scss'

function Directions() {
  const navigate = useNavigate()
  const {
    directions,
    selectDirection,
    selectedDirectionId,
    directionProgressMap,
  } = useLearning()

  const handleViewPlan = (directionId) => {
    selectDirection(directionId)
    navigate(`/plan/${directionId}`)
  }

  return (
    <section>
      <header className='page-header'>
        <h2 className='page-title'>Направления IT</h2>
        <p className='page-subtitle'>Выберите специализацию и перейдите к персональному плану обучения.</p>
      </header>

      {Array.isArray(directions) && directions.length > 0 ? (
        <div className='directions-grid'>
          {directions.map((direction) => (
            <DirectionCard
              key={direction.id}
              direction={direction}
              onViewPlan={handleViewPlan}
              isSelected={selectedDirectionId === direction.id}
              progress={directionProgressMap[direction.id] || 0}
            />
          ))}
        </div>
      ) : (
        <article className='surface-card directions-empty'>
          <h3>Направления пока недоступны</h3>
          <p>Проверьте корректность mock data и попробуйте обновить страницу.</p>
        </article>
      )}
    </section>
  )
}

export default Directions
