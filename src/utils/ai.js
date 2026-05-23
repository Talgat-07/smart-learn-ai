import { formatRuDate } from './progress'

const fallbackAnswer =
  'Пока я работаю в demo-режиме, но могу помочь с обучением, заданиями, календарем и прогрессом.'

const getPendingTasksText = (tasks, taskProgress, directionId) => {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  const safeTaskProgress = taskProgress && typeof taskProgress === 'object' ? taskProgress : {}

  const pending = safeTasks.filter((task) => {
    if (directionId && task.directionId !== directionId) {
      return false
    }

    const status = safeTaskProgress[task.id]?.status || 'not_started'
    return status !== 'completed'
  })

  if (!pending.length) {
    return 'Отлично, сейчас нет невыполненных заданий. Можно переходить к следующему модулю.'
  }

  const preview = pending
    .slice(0, 3)
    .map((task) => `${task.title} (до ${formatRuDate(task.deadline)})`)
    .join('; ')

  return `В работе ${pending.length} заданий. Ближайшие: ${preview}.`
}

const getNextTopicsText = (selectedDirection, learningPlans, topicProgress) => {
  if (!selectedDirection) {
    return 'Сначала выберите направление обучения.'
  }

  const plans = learningPlans && typeof learningPlans === 'object' ? learningPlans : {}
  const progress = topicProgress && typeof topicProgress === 'object' ? topicProgress : {}
  const topics = Array.isArray(plans[selectedDirection.id]) ? plans[selectedDirection.id] : []
  const nextTopic = topics.find(
    (topic) => progress[topic.id]?.status !== 'completed',
  )

  if (!nextTopic) {
    return `Вы завершили все темы по направлению «${selectedDirection.title}». Переходите к итоговому проекту.`
  }

  return `Следующая рекомендуемая тема: «${nextTopic.title}». Начните урок и выполните практические задачи по теме.`
}

const getUpcomingEventsText = (events) => {
  const today = new Date().toISOString().slice(0, 10)

  const safeEvents = Array.isArray(events) ? events : []

  const upcoming = safeEvents
    .filter((event) => event?.date && event.date >= today)
    .sort((first, second) => new Date(first.date) - new Date(second.date))
    .slice(0, 3)

  if (!upcoming.length) {
    return 'В ближайшие дни событий в календаре нет. Добавьте учебные цели вручную на удобные даты.'
  }

  return `Ближайшие события: ${upcoming
    .map((event) => `${formatRuDate(event.date)} — ${event.title}`)
    .join('; ')}.`
}

export const generateAiAnswer = (message, appState) => {
  const text = (message || '').toLowerCase()
  const selectedDirection = appState?.selectedDirection || null

  if (
    !selectedDirection &&
    (text.includes('план') ||
      text.includes('задани') ||
      text.includes('направлен') ||
      text.includes('что учить') ||
      text.includes('прогресс'))
  ) {
    return 'Сначала выберите направление обучения.'
  }

  if (text.includes('react')) {
    return 'React — это библиотека для создания интерфейсов из переиспользуемых компонентов. Начните с JSX, props и state, затем переходите к роутингу и работе с API.'
  }

  if (text.includes('frontend')) {
    return 'Для Frontend-пути держите ритм: HTML и семантика, CSS и адаптив, JavaScript, DOM, затем React и итоговый проект.'
  }

  if (text.includes('javascript')) {
    return 'JavaScript управляет логикой сайта: события, данные, формы и динамические элементы. Лучший способ освоить его — ежедневные практические задачи.'
  }

  if (text.includes('план')) {
    return getNextTopicsText(
      appState.selectedDirection,
      appState?.learningPlans,
      appState?.topicProgress,
    )
  }

  if (text.includes('задани')) {
    return getPendingTasksText(
      appState?.tasks,
      appState?.taskProgress,
      selectedDirection?.id,
    )
  }

  if (text.includes('прогресс')) {
    const overallProgress = appState?.studentStats?.overallProgress || 0
    const completedTopics = appState?.studentStats?.completedTopics || 0
    const totalTopics = appState?.studentStats?.totalTopics || 0

    return `Ваш текущий прогресс: ${overallProgress}%. Выполнено ${completedTopics} тем из ${totalTopics}.`
  }

  if (text.includes('календар')) {
    return getUpcomingEventsText(appState?.calendarEvents)
  }

  if (text.includes('дедлайн')) {
    return getUpcomingEventsText(appState?.calendarEvents)
  }

  return fallbackAnswer
}
