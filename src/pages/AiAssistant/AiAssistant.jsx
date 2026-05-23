import AiChat from '../../components/AiChat/AiChat'
import './AiAssistant.scss'

function AiAssistant() {
  return (
    <section className='ai-assistant-page'>
      <header className='page-header'>
        <h2 className='page-title'>AI-помощник</h2>
        <p className='page-subtitle'>Задавайте вопросы по IT-темам и плану обучения. Ответы работают в demo-режиме без внешнего API.</p>
      </header>

      <AiChat />
    </section>
  )
}

export default AiAssistant
