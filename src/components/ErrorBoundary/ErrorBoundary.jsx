import { Component } from 'react'
import { clearStorageByPrefix } from '../../utils/storage'
import './ErrorBoundary.scss'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Необработанная ошибка приложения:', error, info)
  }

  handleClearData = () => {
    clearStorageByPrefix('smart-learn:')
    window.location.reload()
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className='app-error-boundary'>
          <article className='app-error-boundary__card'>
            <h1>Что-то пошло не так</h1>
            <p>Попробуйте обновить страницу или сбросить прогресс.</p>
            <div className='app-error-boundary__actions'>
              <button type='button' className='secondary-btn' onClick={this.handleClearData}>
                Сбросить локальные данные
              </button>
              <button type='button' className='primary-btn' onClick={this.handleReload}>
                Обновить страницу
              </button>
            </div>
          </article>
        </section>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
