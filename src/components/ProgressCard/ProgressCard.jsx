import './ProgressCard.scss'

function ProgressCard({ label, value, description }) {
  return (
    <article className='progress-card'>
      <p className='progress-card__label'>{label}</p>
      <h3 className='progress-card__value'>{value}</h3>
      <p className='progress-card__description'>{description}</p>
    </article>
  )
}

export default ProgressCard
