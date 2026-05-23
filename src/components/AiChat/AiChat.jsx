import { useEffect, useMemo, useRef, useState } from 'react'
import { useLearning } from '../../context/LearningContext'
import { generateAiAnswer } from '../../utils/ai'
import './AiChat.scss'

const quickQuestions = [
  'Какой у меня прогресс?',
  'Что учить дальше?',
  'Какие задания нужно выполнить?',
  'Покажи ближайшие дедлайны',
]

function AiChat() {
  const {
    aiMessages,
    setAiMessages,
    selectedDirection,
    learningPlans,
    topicProgress,
    tasks,
    taskProgress,
    calendarEvents,
    studentStats,
  } = useLearning()

  const [question, setQuestion] = useState('')
  const messageCounterRef = useRef(Array.isArray(aiMessages) ? aiMessages.length + 1 : 1)

  useEffect(() => {
    const currentLength = Array.isArray(aiMessages) ? aiMessages.length : 0

    if (currentLength + 1 > messageCounterRef.current) {
      messageCounterRef.current = currentLength + 1
    }
  }, [aiMessages])

  const appStateForAi = useMemo(
    () => ({
      selectedDirection,
      learningPlans,
      topicProgress,
      tasks,
      taskProgress,
      calendarEvents,
      studentStats,
    }),
    [
      selectedDirection,
      learningPlans,
      topicProgress,
      tasks,
      taskProgress,
      calendarEvents,
      studentStats,
    ],
  )

  const pushMessages = (userText) => {
    const cleanText = (userText || '').trim()

    if (!cleanText) {
      return
    }

    const nextMessageId = (prefix) => {
      const id = `${prefix}-${messageCounterRef.current}`
      messageCounterRef.current += 1
      return id
    }

    const now = new Date().toISOString()
    const userMessage = {
      id: nextMessageId('user'),
      author: 'user',
      text: cleanText,
      createdAt: now,
    }

    const aiMessage = {
      id: nextMessageId('ai'),
      author: 'ai',
      text: generateAiAnswer(cleanText, appStateForAi),
      createdAt: new Date().toISOString(),
    }

    setAiMessages((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      return [...safePrev, userMessage, aiMessage].slice(-80)
    })
    setQuestion('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    pushMessages(question)
  }

  return (
    <section className='ai-chat'>
      <div className='ai-chat__quick'>
        {quickQuestions.map((item) => (
          <button key={item} type='button' className='ghost-btn' onClick={() => pushMessages(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className='ai-chat__window'>
        {(Array.isArray(aiMessages) ? aiMessages : []).map((message) => (
          <div
            key={message.id}
            className={`ai-chat__message ai-chat__message--${message.author}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form className='ai-chat__form' onSubmit={handleSubmit}>
        <input
          type='text'
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder='Введите вопрос по обучению...'
        />
        <button type='submit' className='primary-btn'>
          Отправить
        </button>
      </form>
    </section>
  )
}

export default AiChat
