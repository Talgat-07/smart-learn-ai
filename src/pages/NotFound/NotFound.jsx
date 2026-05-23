import { Link } from 'react-router-dom'
import './NotFound.scss'

function NotFound() {
  return (
    <section className='not-found-page surface-card'>
      <h2>Страница не найдена (404)</h2>
      <p>Проверьте адрес страницы или вернитесь к основным разделам платформы.</p>
      <div className='not-found-page__actions'>
        <Link className='primary-btn' to='/'>
          На главную
        </Link>
        <Link className='ghost-btn' to='/directions'>
          К направлениям
        </Link>
      </div>
    </section>
  )
}

export default NotFound
