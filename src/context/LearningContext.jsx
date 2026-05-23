/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { directions } from '../data/directions'
import { learningPlans, topicsById } from '../data/learningPlans'
import { tasks, tasksById } from '../data/tasks'
import { calendarEvents as mockCalendarEvents } from '../data/calendarEvents'
import {
  CALENDAR_STATUS,
  CALENDAR_TYPE,
  TASK_STATUS,
  TOPIC_STATUS,
  calculateOverallTopicProgress,
  calculateTaskProgress,
  calculateTaskSummary,
  generateAiRecommendation,
  generateAiReview,
  getDirectionTopicProgress,
  normalizeDateKey,
  toDateInput,
} from '../utils/progress'
import { runDebugChecks } from '../utils/debugChecks'
import { getFromStorage, removeFromStorage, saveToStorage } from '../utils/storage'

const STORAGE_KEYS = {
  selectedDirectionId: 'smart-learn:selected-direction',
  topicProgress: 'smart-learn:topic-progress',
  taskProgress: 'smart-learn:task-progress-v2',
  calendarEvents: 'smart-learn:calendar-events',
  activities: 'smart-learn:activities',
  aiMessages: 'smart-learn:ai-messages',
}

const safeDirections = Array.isArray(directions) ? directions : []
const safeLearningPlans =
  learningPlans && typeof learningPlans === 'object' ? learningPlans : {}
const safeTasks = Array.isArray(tasks) ? tasks : []

const createInitialAiMessages = () => [
  {
    id: 'ai-welcome',
    author: 'ai',
    text: 'Здравствуйте! Я AI-помощник. Могу помочь с планом обучения, заданиями и объяснением IT-тем.',
    createdAt: new Date().toISOString(),
  },
]

const LearningContext = createContext(null)

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`

const normalizeTopicStatus = (status) => {
  if (status === 'done') {
    return TOPIC_STATUS.COMPLETED
  }

  if (status === TOPIC_STATUS.COMPLETED || status === TOPIC_STATUS.IN_PROGRESS) {
    return status
  }

  return TOPIC_STATUS.NOT_STARTED
}

const normalizeTaskStatus = (status) => {
  if (status === 'done') {
    return TASK_STATUS.COMPLETED
  }

  if (status === 'reviewed') {
    return TASK_STATUS.CHECKED
  }

  if (
    status === TASK_STATUS.IN_PROGRESS ||
    status === TASK_STATUS.SUBMITTED ||
    status === TASK_STATUS.CHECKED ||
    status === TASK_STATUS.NEEDS_FIX ||
    status === TASK_STATUS.COMPLETED
  ) {
    return status
  }

  return TASK_STATUS.NOT_STARTED
}

const normalizeCalendarStatus = (status) => {
  if (status === 'Выполнено') {
    return CALENDAR_STATUS.COMPLETED
  }

  if (status === 'В процессе') {
    return CALENDAR_STATUS.IN_PROGRESS
  }

  if (status === 'Просрочено') {
    return CALENDAR_STATUS.OVERDUE
  }

  if (
    status === CALENDAR_STATUS.COMPLETED ||
    status === CALENDAR_STATUS.IN_PROGRESS ||
    status === CALENDAR_STATUS.OVERDUE
  ) {
    return status
  }

  return CALENDAR_STATUS.PLANNED
}

const normalizeCalendarType = (type) => {
  if (type === 'Задание') {
    return CALENDAR_TYPE.TASK
  }

  if (type === 'Дедлайн') {
    return CALENDAR_TYPE.DEADLINE
  }

  if (type === 'Тест') {
    return CALENDAR_TYPE.TEST
  }

  if (type === 'Выполнено') {
    return CALENDAR_TYPE.COMPLETED
  }

  if (
    type === CALENDAR_TYPE.LESSON ||
    type === CALENDAR_TYPE.TASK ||
    type === CALENDAR_TYPE.DEADLINE ||
    type === CALENDAR_TYPE.TEST ||
    type === CALENDAR_TYPE.COMPLETED
  ) {
    return type
  }

  return CALENDAR_TYPE.LESSON
}

const normalizeTopicProgressState = (rawValue) => {
  if (!rawValue || typeof rawValue !== 'object') {
    return {}
  }

  const normalized = {}

  Object.values(rawValue).forEach((item) => {
    if (!item?.topicId || !item?.directionId) {
      return
    }

    normalized[item.topicId] = {
      topicId: item.topicId,
      directionId: item.directionId,
      status: normalizeTopicStatus(item.status),
      startedAt: item.startedAt || null,
      completedAt: item.completedAt || null,
    }
  })

  return normalized
}

const normalizeTaskProgressState = (rawValue) => {
  if (!rawValue || typeof rawValue !== 'object') {
    return {}
  }

  const normalized = {}

  Object.entries(rawValue).forEach(([taskId, item]) => {
    normalized[taskId] = {
      taskId,
      answer: item?.answer || '',
      status: normalizeTaskStatus(item?.status),
      score: typeof item?.score === 'number' ? item.score : null,
      aiComment: item?.aiComment || '',
      startedAt: item?.startedAt || null,
      submittedAt: item?.submittedAt || null,
      checkedAt: item?.checkedAt || null,
      completedAt: item?.completedAt || null,
      history: Array.isArray(item?.history)
        ? item.history.map((historyItem) => ({
            id: historyItem?.id || makeId('history'),
            date: historyItem?.date || new Date().toISOString(),
            answer: historyItem?.answer || '',
            status: normalizeTaskStatus(historyItem?.status),
            score: typeof historyItem?.score === 'number' ? historyItem.score : null,
            comment: historyItem?.comment || '',
          }))
        : [],
    }
  })

  return normalized
}

const normalizeCalendarEventsState = (rawValue, source = 'manual') => {
  if (!Array.isArray(rawValue)) {
    return []
  }

  return rawValue
    .map((event) => {
      const date = normalizeDateKey(event?.date)

      if (!date) {
        return null
      }

      return {
        id: event?.id || event?.eventId || makeId('event'),
        title: event?.title || event?.event || 'Событие',
        date,
        type: normalizeCalendarType(event?.type),
        status: normalizeCalendarStatus(event?.status),
        relatedTaskId: event?.relatedTaskId || null,
        relatedTopicId: event?.relatedTopicId || null,
        grade: typeof event?.grade === 'number' ? event.grade : null,
        source: event?.source || source,
      }
    })
    .filter(Boolean)
}

const normalizeActivitiesState = (rawValue) => {
  if (!Array.isArray(rawValue)) {
    return []
  }

  return rawValue
    .map((item) => ({
      id: item?.id || makeId('activity'),
      text: item?.text || 'Активность',
      date: item?.date || item?.createdAt || new Date().toISOString(),
      type: item?.type || 'system',
    }))
    .slice(0, 120)
}

const normalizeAiMessagesState = (rawValue) => {
  if (!Array.isArray(rawValue) || rawValue.length === 0) {
    return createInitialAiMessages()
  }

  return rawValue
    .map((item) => ({
      id: item?.id || makeId('msg'),
      author: item?.author === 'user' ? 'user' : 'ai',
      text: item?.text || '',
      createdAt: item?.createdAt || new Date().toISOString(),
    }))
    .filter((item) => Boolean(item.text))
}

const createActivityItem = (text, type = 'system') => ({
  id: makeId('activity'),
  text,
  type,
  date: new Date().toISOString(),
})

const getDeadlineStatus = (task, taskState) => {
  const today = toDateInput()
  const status = taskState?.status || TASK_STATUS.NOT_STARTED

  if (status === TASK_STATUS.COMPLETED) {
    return CALENDAR_STATUS.COMPLETED
  }

  if (task.deadline < today) {
    return CALENDAR_STATUS.OVERDUE
  }

  if (
    status === TASK_STATUS.IN_PROGRESS ||
    status === TASK_STATUS.SUBMITTED ||
    status === TASK_STATUS.CHECKED ||
    status === TASK_STATUS.NEEDS_FIX
  ) {
    return CALENDAR_STATUS.IN_PROGRESS
  }

  return CALENDAR_STATUS.PLANNED
}

export function LearningProvider({ children }) {
  const [selectedDirectionId, setSelectedDirectionId] = useState(() => {
    const stored = getFromStorage(STORAGE_KEYS.selectedDirectionId, null)

    if (safeDirections.some((item) => item.id === stored)) {
      return stored
    }

    return null
  })

  const [topicProgress, setTopicProgress] = useState(() =>
    normalizeTopicProgressState(getFromStorage(STORAGE_KEYS.topicProgress, {})),
  )

  const [taskProgress, setTaskProgress] = useState(() =>
    normalizeTaskProgressState(getFromStorage(STORAGE_KEYS.taskProgress, {})),
  )

  const [calendarEvents, setCalendarEvents] = useState(() => {
    const saved = normalizeCalendarEventsState(
      getFromStorage(STORAGE_KEYS.calendarEvents, null),
      'manual',
    )

    if (saved.length > 0) {
      return saved
    }

    return normalizeCalendarEventsState(mockCalendarEvents, 'mock')
  })

  const [activities, setActivities] = useState(() =>
    normalizeActivitiesState(getFromStorage(STORAGE_KEYS.activities, [])),
  )

  const [aiMessages, setAiMessages] = useState(() =>
    normalizeAiMessagesState(getFromStorage(STORAGE_KEYS.aiMessages, createInitialAiMessages())),
  )

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.selectedDirectionId, selectedDirectionId)
  }, [selectedDirectionId])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.topicProgress, topicProgress)
  }, [topicProgress])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.taskProgress, taskProgress)
  }, [taskProgress])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.calendarEvents, calendarEvents)
  }, [calendarEvents])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.activities, activities)
  }, [activities])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.aiMessages, aiMessages)
  }, [aiMessages])

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return
    }

    runDebugChecks({
      directions: safeDirections,
      learningPlans: safeLearningPlans,
      tasks: safeTasks,
      calendarEvents: mockCalendarEvents,
    })
  }, [])

  const addActivity = (text, type = 'system') => {
    if (!text) {
      return
    }

    setActivities((prev) => [createActivityItem(text, type), ...prev].slice(0, 120))
  }

  const addSystemCalendarEvent = ({
    title,
    date,
    type,
    status,
    relatedTaskId,
    relatedTopicId,
    grade = null,
  }) => {
    const normalizedDate = normalizeDateKey(date || new Date())

    if (!normalizedDate) {
      return
    }

    const event = {
      id: makeId('event'),
      title: title || 'Системное событие',
      date: normalizedDate,
      type: normalizeCalendarType(type),
      status: normalizeCalendarStatus(status),
      relatedTaskId: relatedTaskId || null,
      relatedTopicId: relatedTopicId || null,
      grade,
      source: 'system',
    }

    setCalendarEvents((prev) => [event, ...prev])
  }

  const selectedDirection =
    safeDirections.find((direction) => direction.id === selectedDirectionId) || null

  const selectDirection = (directionId) => {
    const direction = safeDirections.find((item) => item.id === directionId)

    if (!direction) {
      return false
    }

    if (selectedDirectionId === directionId) {
      return true
    }

    setSelectedDirectionId(directionId)
    addActivity(`Вы выбрали направление: ${direction.title}`, 'direction')
    return true
  }

  const startTopic = (topicId) => {
    const topic = topicsById?.[topicId]

    if (!topic) {
      return false
    }

    const current = topicProgress[topicId]

    if (
      current?.status === TOPIC_STATUS.IN_PROGRESS ||
      current?.status === TOPIC_STATUS.COMPLETED
    ) {
      return false
    }

    const startedAt = new Date().toISOString()

    setTopicProgress((prev) => ({
      ...prev,
      [topicId]: {
        topicId,
        directionId: topic.directionId,
        status: TOPIC_STATUS.IN_PROGRESS,
        startedAt,
        completedAt: null,
      },
    }))

    addActivity(`Вы начали урок: ${topic.title}`, 'topic_started')
    addSystemCalendarEvent({
      title: `Начат урок: ${topic.title}`,
      date: startedAt,
      type: CALENDAR_TYPE.LESSON,
      status: CALENDAR_STATUS.IN_PROGRESS,
      relatedTopicId: topicId,
    })

    return true
  }

  const completeTopic = (topicId) => {
    const topic = topicsById?.[topicId]

    if (!topic) {
      return false
    }

    const current = topicProgress[topicId]

    if (current?.status === TOPIC_STATUS.COMPLETED) {
      return false
    }

    const completedAt = new Date().toISOString()

    setTopicProgress((prev) => ({
      ...prev,
      [topicId]: {
        topicId,
        directionId: topic.directionId,
        status: TOPIC_STATUS.COMPLETED,
        startedAt: prev[topicId]?.startedAt || completedAt,
        completedAt,
      },
    }))

    addActivity(`Вы завершили урок: ${topic.title}`, 'topic_completed')
    addSystemCalendarEvent({
      title: `Завершен урок: ${topic.title}`,
      date: completedAt,
      type: CALENDAR_TYPE.COMPLETED,
      status: CALENDAR_STATUS.COMPLETED,
      relatedTopicId: topicId,
    })

    return true
  }

  const startTask = (taskId) => {
    const task = tasksById?.[taskId]

    if (!task) {
      return false
    }

    const current = taskProgress[taskId]

    if (
      current?.status === TASK_STATUS.IN_PROGRESS ||
      current?.status === TASK_STATUS.SUBMITTED ||
      current?.status === TASK_STATUS.CHECKED ||
      current?.status === TASK_STATUS.COMPLETED
    ) {
      return false
    }

    const startedAt = new Date().toISOString()

    setTaskProgress((prev) => ({
      ...prev,
      [taskId]: {
        taskId,
        answer: prev[taskId]?.answer || '',
        status: TASK_STATUS.IN_PROGRESS,
        score: prev[taskId]?.score ?? null,
        aiComment: prev[taskId]?.aiComment || '',
        startedAt,
        submittedAt: prev[taskId]?.submittedAt || null,
        checkedAt: prev[taskId]?.checkedAt || null,
        completedAt: prev[taskId]?.completedAt || null,
        history: Array.isArray(prev[taskId]?.history) ? prev[taskId].history : [],
      },
    }))

    addActivity(`Вы начали задание: ${task.title}`, 'task_started')
    addSystemCalendarEvent({
      title: `Начато задание: ${task.title}`,
      date: startedAt,
      type: CALENDAR_TYPE.TASK,
      status: CALENDAR_STATUS.IN_PROGRESS,
      relatedTaskId: taskId,
      relatedTopicId: task.topicId,
    })

    return true
  }

  const setTaskAnswer = (taskId, answer) => {
    const task = tasksById?.[taskId]

    if (!task) {
      return false
    }

    const normalizedAnswer = typeof answer === 'string' ? answer : ''

    setTaskProgress((prev) => {
      const current = prev[taskId] || {}
      const hasText = Boolean(normalizedAnswer.trim())
      let nextStatus = current.status || TASK_STATUS.NOT_STARTED

      if (!hasText && nextStatus === TASK_STATUS.IN_PROGRESS) {
        nextStatus = TASK_STATUS.NOT_STARTED
      } else if (
        hasText &&
        (nextStatus === TASK_STATUS.NOT_STARTED ||
          nextStatus === TASK_STATUS.NEEDS_FIX ||
          nextStatus === TASK_STATUS.SUBMITTED ||
          nextStatus === TASK_STATUS.CHECKED)
      ) {
        nextStatus = TASK_STATUS.IN_PROGRESS
      }

      return {
        ...prev,
        [taskId]: {
          taskId,
          answer: normalizedAnswer,
          status: nextStatus,
          score: typeof current.score === 'number' ? current.score : null,
          aiComment: current.aiComment || '',
          startedAt: current.startedAt || (hasText ? new Date().toISOString() : null),
          submittedAt: current.submittedAt || null,
          checkedAt: current.checkedAt || null,
          completedAt: current.completedAt || null,
          history: Array.isArray(current.history) ? current.history : [],
        },
      }
    })

    return true
  }

  const checkTaskWithAi = (taskId, preparedAnswer = null) => {
    const task = tasksById?.[taskId]

    if (!task) {
      return { ok: false, error: 'Задание не найдено' }
    }

    const currentState = taskProgress[taskId] || {}
    const answer = (preparedAnswer ?? currentState.answer ?? '').trim()

    if (!answer) {
      return { ok: false, error: 'Напишите ответ перед отправкой' }
    }

    const review = generateAiReview(answer, task)
    const checkedAt = new Date().toISOString()

    setTaskProgress((prev) => {
      const state = prev[taskId] || {}

      return {
        ...prev,
        [taskId]: {
          taskId,
          answer,
          status: review.status,
          score: review.score,
          aiComment: review.comment,
          startedAt: state.startedAt || checkedAt,
          submittedAt: state.submittedAt || checkedAt,
          checkedAt,
          completedAt:
            review.status === TASK_STATUS.COMPLETED
              ? checkedAt
              : state.completedAt || null,
          history: [
            ...(Array.isArray(state.history) ? state.history : []),
            {
              id: makeId('history'),
              date: checkedAt,
              answer,
              status: review.status,
              score: review.score,
              comment: review.comment,
            },
          ].slice(-6),
        },
      }
    })

    addActivity(`AI проверил задание: ${task.title}`, 'task_checked')
    addSystemCalendarEvent({
      title: `AI-проверка: ${task.title}`,
      date: checkedAt,
      type: CALENDAR_TYPE.TEST,
      status:
        review.status === TASK_STATUS.COMPLETED
          ? CALENDAR_STATUS.COMPLETED
          : CALENDAR_STATUS.IN_PROGRESS,
      relatedTaskId: taskId,
      relatedTopicId: task.topicId,
      grade: review.score,
    })

    return { ok: true, review }
  }

  const submitTask = (taskId, answer) => {
    const task = tasksById?.[taskId]

    if (!task) {
      return { ok: false, error: 'Задание не найдено' }
    }

    const preparedAnswer = (answer || '').trim()

    if (!preparedAnswer) {
      return { ok: false, error: 'Напишите ответ перед отправкой' }
    }

    const submittedAt = new Date().toISOString()

    setTaskProgress((prev) => {
      const current = prev[taskId] || {}

      return {
        ...prev,
        [taskId]: {
          taskId,
          answer: preparedAnswer,
          status: TASK_STATUS.SUBMITTED,
          score: typeof current.score === 'number' ? current.score : null,
          aiComment: current.aiComment || '',
          startedAt: current.startedAt || submittedAt,
          submittedAt,
          checkedAt: current.checkedAt || null,
          completedAt: current.completedAt || null,
          history: Array.isArray(current.history) ? current.history : [],
        },
      }
    })

    addActivity(`Вы отправили задание: ${task.title}`, 'task_submitted')
    addSystemCalendarEvent({
      title: `Отправлено задание: ${task.title}`,
      date: submittedAt,
      type: CALENDAR_TYPE.TASK,
      status: CALENDAR_STATUS.IN_PROGRESS,
      relatedTaskId: taskId,
      relatedTopicId: task.topicId,
    })

    return checkTaskWithAi(taskId, preparedAnswer)
  }

  const completeTask = (taskId) => {
    const task = tasksById?.[taskId]

    if (!task) {
      return false
    }

    const current = taskProgress[taskId] || {}

    if (current.status === TASK_STATUS.COMPLETED) {
      return false
    }

    const completedAt = new Date().toISOString()

    setTaskProgress((prev) => ({
      ...prev,
      [taskId]: {
        taskId,
        answer: prev[taskId]?.answer || '',
        status: TASK_STATUS.COMPLETED,
        score: typeof prev[taskId]?.score === 'number' ? prev[taskId].score : 80,
        aiComment:
          prev[taskId]?.aiComment ||
          'Задание отмечено как выполненное. Отличная работа!',
        startedAt: prev[taskId]?.startedAt || completedAt,
        submittedAt: prev[taskId]?.submittedAt || completedAt,
        checkedAt: prev[taskId]?.checkedAt || completedAt,
        completedAt,
        history: Array.isArray(prev[taskId]?.history) ? prev[taskId].history : [],
      },
    }))

    addActivity(`Задание выполнено: ${task.title}`, 'task_completed')
    addSystemCalendarEvent({
      title: `Завершено задание: ${task.title}`,
      date: completedAt,
      type: CALENDAR_TYPE.COMPLETED,
      status: CALENDAR_STATUS.COMPLETED,
      relatedTaskId: taskId,
      relatedTopicId: task.topicId,
      grade: typeof current.score === 'number' ? current.score : 80,
    })

    return true
  }

  const addCalendarEvent = (event) => {
    const normalizedDate = normalizeDateKey(event?.date || new Date())

    if (!normalizedDate) {
      return null
    }

    const nextEvent = {
      id: event?.id || makeId('event'),
      title: event?.title || 'Новое событие',
      date: normalizedDate,
      type: normalizeCalendarType(event?.type),
      status: normalizeCalendarStatus(event?.status),
      relatedTaskId: event?.relatedTaskId || null,
      relatedTopicId: event?.relatedTopicId || null,
      grade: typeof event?.grade === 'number' ? event.grade : null,
      source: event?.source || 'manual',
    }

    setCalendarEvents((prev) => [nextEvent, ...prev])
    addActivity(`Добавлено событие в календарь: ${nextEvent.title}`, 'calendar_add')

    return nextEvent
  }

  const updateCalendarEvent = (eventId, data) => {
    const existingEvent = calendarEvents.find((event) => event.id === eventId)

    if (!existingEvent) {
      return null
    }

    const nextDate = data?.date ? normalizeDateKey(data.date) : existingEvent.date

    if (!nextDate) {
      return null
    }

    const updatedEvent = {
      ...existingEvent,
      ...data,
      date: nextDate,
      type: data?.type ? normalizeCalendarType(data.type) : existingEvent.type,
      status: data?.status
        ? normalizeCalendarStatus(data.status)
        : existingEvent.status,
    }

    setCalendarEvents((prev) =>
      prev.map((event) => (event.id === eventId ? updatedEvent : event)),
    )

    addActivity(`Обновлено событие: ${updatedEvent.title}`, 'calendar_update')
    return updatedEvent
  }

  const deleteCalendarEvent = (eventId) => {
    const event = calendarEvents.find((item) => item.id === eventId)

    if (!event) {
      return false
    }

    setCalendarEvents((prev) => prev.filter((item) => item.id !== eventId))
    addActivity(`Удалено событие: ${event.title}`, 'calendar_delete')
    return true
  }

  const markCalendarEventCompleted = (eventId) => {
    const updated = updateCalendarEvent(eventId, {
      status: CALENDAR_STATUS.COMPLETED,
      type: CALENDAR_TYPE.COMPLETED,
    })

    if (!updated) {
      return false
    }

    addActivity(`Событие отмечено как выполненное: ${updated.title}`, 'calendar_done')
    return true
  }

  const resetProgress = () => {
    setSelectedDirectionId(null)
    setTopicProgress({})
    setTaskProgress({})
    setCalendarEvents(normalizeCalendarEventsState(mockCalendarEvents, 'mock'))
    setActivities([])
    setAiMessages(createInitialAiMessages())

    Object.values(STORAGE_KEYS).forEach((key) => {
      removeFromStorage(key)
    })

    return true
  }

  const deadlineEvents = useMemo(
    () =>
      safeTasks
        .map((task) => {
          const state = taskProgress[task.id] || {}
          const normalizedDate = normalizeDateKey(task.deadline)

          if (!normalizedDate) {
            return null
          }

          return {
            id: `deadline-${task.id}`,
            title: `Дедлайн задания: ${task.title}`,
            date: normalizedDate,
            type: CALENDAR_TYPE.DEADLINE,
            status: getDeadlineStatus(task, state),
            relatedTaskId: task.id,
            relatedTopicId: task.topicId,
            grade: typeof state.score === 'number' ? state.score : null,
            source: 'deadline',
          }
        })
        .filter(Boolean),
    [taskProgress],
  )

  const mergedCalendarEvents = useMemo(() => {
    const map = new Map()
    const allEvents = calendarEvents.concat(deadlineEvents)

    allEvents.forEach((event) => {
      map.set(event.id, event)
    })

    return Array.from(map.values()).sort((first, second) => {
      const firstTime = new Date(first.date).getTime()
      const secondTime = new Date(second.date).getTime()

      if (Number.isNaN(firstTime)) {
        return 1
      }

      if (Number.isNaN(secondTime)) {
        return -1
      }

      return firstTime - secondTime
    })
  }, [calendarEvents, deadlineEvents])

  const calculateDirectionProgress = (directionId) =>
    getDirectionTopicProgress(directionId, safeLearningPlans, topicProgress)

  const topicProgressPercent = useMemo(
    () => calculateOverallTopicProgress(safeLearningPlans, topicProgress),
    [topicProgress],
  )

  const taskProgressPercent = useMemo(
    () => calculateTaskProgress(safeTasks, taskProgress),
    [taskProgress],
  )

  const overallProgress = useMemo(
    () => Math.round((topicProgressPercent + taskProgressPercent) / 2),
    [topicProgressPercent, taskProgressPercent],
  )

  const directionProgressMap = useMemo(
    () =>
      Object.fromEntries(
        safeDirections.map((direction) => [
          direction.id,
          getDirectionTopicProgress(direction.id, safeLearningPlans, topicProgress),
        ]),
      ),
    [topicProgress],
  )

  const studentStats = useMemo(() => {
    const allTopics = Object.values(safeLearningPlans).flat()
    const completedTopics = allTopics.filter(
      (topic) => topicProgress[topic.id]?.status === TOPIC_STATUS.COMPLETED,
    ).length
    const startedTopics = allTopics.filter(
      (topic) => topicProgress[topic.id]?.status === TOPIC_STATUS.IN_PROGRESS,
    ).length
    const taskSummary = calculateTaskSummary(safeTasks, taskProgress)

    return {
      studentName: 'Студент',
      selectedDirection,
      overallProgress,
      topicProgressPercent,
      taskProgressPercent,
      totalTopics: allTopics.length,
      completedTopics,
      startedTopics,
      totalTasks: taskSummary.total,
      completedTasks: taskSummary.completed,
      tasksInProgress: taskSummary.inProgress,
      overdueTasks: taskSummary.overdue,
      averageScore: taskSummary.averageScore,
      selectedDirectionProgress: selectedDirection
        ? getDirectionTopicProgress(selectedDirection.id, safeLearningPlans, topicProgress)
        : 0,
      aiRecommendation: generateAiRecommendation({
        overallProgress,
        startedTopics,
        overdueTasks: taskSummary.overdue,
      }),
    }
  }, [
    selectedDirection,
    topicProgress,
    taskProgress,
    overallProgress,
    topicProgressPercent,
    taskProgressPercent,
  ])

  const calculateOverallProgress = () => overallProgress
  const getStudentStats = () => studentStats

  const value = {
    directions: safeDirections,
    learningPlans: safeLearningPlans,
    tasks: safeTasks,
    selectedDirectionId,
    selectedDirection,
    topicProgress,
    taskProgress,
    calendarEvents: mergedCalendarEvents,
    customCalendarEvents: calendarEvents,
    activities,
    aiMessages,
    directionProgressMap,
    studentStats,

    setAiMessages,
    setTaskAnswer,
    addActivity,
    selectDirection,
    startTopic,
    completeTopic,
    startTask,
    submitTask,
    checkTaskWithAi,
    completeTask,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    markCalendarEventCompleted,
    calculateDirectionProgress,
    calculateOverallProgress,
    getStudentStats,
    resetProgress,
  }

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}

export function useLearning() {
  const context = useContext(LearningContext)

  if (!context) {
    throw new Error('useLearning должен использоваться внутри LearningProvider')
  }

  return context
}
