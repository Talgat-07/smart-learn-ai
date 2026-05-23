export const TOPIC_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
}

export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  CHECKED: 'checked',
  NEEDS_FIX: 'needs_fix',
  COMPLETED: 'completed',
}

export const CALENDAR_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
}

export const CALENDAR_TYPE = {
  LESSON: 'lesson',
  TASK: 'task',
  DEADLINE: 'deadline',
  TEST: 'test',
  COMPLETED: 'completed',
}

const topicStatusLabels = {
  [TOPIC_STATUS.NOT_STARTED]: 'Не начато',
  [TOPIC_STATUS.IN_PROGRESS]: 'В процессе',
  [TOPIC_STATUS.COMPLETED]: 'Выполнено',
}

const taskStatusLabels = {
  [TASK_STATUS.NOT_STARTED]: 'Не начато',
  [TASK_STATUS.IN_PROGRESS]: 'В процессе',
  [TASK_STATUS.SUBMITTED]: 'Отправлено',
  [TASK_STATUS.CHECKED]: 'Проверено',
  [TASK_STATUS.NEEDS_FIX]: 'Нужно исправить',
  [TASK_STATUS.COMPLETED]: 'Выполнено',
}

const calendarStatusLabels = {
  [CALENDAR_STATUS.PLANNED]: 'Запланировано',
  [CALENDAR_STATUS.IN_PROGRESS]: 'В процессе',
  [CALENDAR_STATUS.COMPLETED]: 'Выполнено',
  [CALENDAR_STATUS.OVERDUE]: 'Просрочено',
}

const calendarTypeLabels = {
  [CALENDAR_TYPE.LESSON]: 'Урок',
  [CALENDAR_TYPE.TASK]: 'Задание',
  [CALENDAR_TYPE.DEADLINE]: 'Дедлайн',
  [CALENDAR_TYPE.TEST]: 'Проверка',
  [CALENDAR_TYPE.COMPLETED]: 'Выполнено',
}

export const taskFilterOptions = [
  { id: 'all', label: 'Все' },
  { id: TASK_STATUS.NOT_STARTED, label: 'Не начато' },
  { id: TASK_STATUS.IN_PROGRESS, label: 'В процессе' },
  { id: TASK_STATUS.SUBMITTED, label: 'Отправлено' },
  { id: TASK_STATUS.CHECKED, label: 'Проверено' },
  { id: TASK_STATUS.NEEDS_FIX, label: 'Нужно исправить' },
  { id: TASK_STATUS.COMPLETED, label: 'Выполнено' },
]

export const getTopicStatusLabel = (status) =>
  topicStatusLabels[status] || topicStatusLabels[TOPIC_STATUS.NOT_STARTED]

export const getTaskStatusLabel = (status) =>
  taskStatusLabels[status] || taskStatusLabels[TASK_STATUS.NOT_STARTED]

export const getCalendarStatusLabel = (status) =>
  calendarStatusLabels[status] || calendarStatusLabels[CALENDAR_STATUS.PLANNED]

export const getCalendarTypeLabel = (type) =>
  calendarTypeLabels[type] || 'Событие'

export const getTopicStatusClass = (status) => {
  if (status === TOPIC_STATUS.COMPLETED) {
    return 'success'
  }

  if (status === TOPIC_STATUS.IN_PROGRESS) {
    return 'warning'
  }

  return 'planned'
}

export const getTaskStatusClass = (status) => {
  if (status === TASK_STATUS.COMPLETED) {
    return 'success'
  }

  if (status === TASK_STATUS.CHECKED) {
    return 'review'
  }

  if (status === TASK_STATUS.NEEDS_FIX) {
    return 'danger'
  }

  if (status === TASK_STATUS.SUBMITTED || status === TASK_STATUS.IN_PROGRESS) {
    return 'warning'
  }

  return 'planned'
}

export const getCalendarEventClass = (event) => {
  if (event.type === CALENDAR_TYPE.TEST) {
    return 'review'
  }

  if (event.status === CALENDAR_STATUS.COMPLETED) {
    return 'success'
  }

  if (event.status === CALENDAR_STATUS.IN_PROGRESS) {
    return 'warning'
  }

  if (event.status === CALENDAR_STATUS.OVERDUE) {
    return 'danger'
  }

  return 'planned'
}

export const formatRuDate = (dateValue) => {
  if (!dateValue) {
    return '-'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'Некорректная дата'
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export const toDateInput = (dateValue = new Date()) => {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const normalizeDateKey = (dateValue) => {
  if (!dateValue) {
    return ''
  }

  const normalized = toDateInput(dateValue)
  return normalized || ''
}

export const isSameDate = (first, second) =>
  normalizeDateKey(first) === normalizeDateKey(second)

export const getMonthLabel = (dateValue) =>
  Number.isNaN(new Date(dateValue).getTime())
    ? 'Некорректный месяц'
    : new Date(dateValue).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      })

export const getMonthMatrix = (dateValue) => {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return []
  }

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  const startOffset = (monthStart.getDay() + 6) % 7
  const totalDays = monthEnd.getDate()

  const cells = []

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), day))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  const weeks = []
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7))
  }

  return weeks
}

export const getDirectionTopicProgress = (directionId, learningPlans, topicProgress) => {
  const plans = learningPlans && typeof learningPlans === 'object' ? learningPlans : {}
  const progress = topicProgress && typeof topicProgress === 'object' ? topicProgress : {}
  const topics = Array.isArray(plans[directionId]) ? plans[directionId] : []

  if (!topics.length) {
    return 0
  }

  const completed = topics.filter(
    (topic) => progress[topic.id]?.status === TOPIC_STATUS.COMPLETED,
  ).length

  return Math.round((completed / topics.length) * 100)
}

export const calculateOverallTopicProgress = (learningPlans, topicProgress) => {
  const plans = learningPlans && typeof learningPlans === 'object' ? learningPlans : {}
  const progress = topicProgress && typeof topicProgress === 'object' ? topicProgress : {}
  const allTopics = Object.values(plans).flat()

  if (!allTopics.length) {
    return 0
  }

  const completed = allTopics.filter(
    (topic) => progress[topic.id]?.status === TOPIC_STATUS.COMPLETED,
  ).length

  return Math.round((completed / allTopics.length) * 100)
}

export const isTaskCompleted = (status) => status === TASK_STATUS.COMPLETED

export const calculateTaskProgress = (tasks, taskProgress) => {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  const progress = taskProgress && typeof taskProgress === 'object' ? taskProgress : {}

  if (!safeTasks.length) {
    return 0
  }

  const completed = safeTasks.filter((task) =>
    isTaskCompleted(progress[task.id]?.status || TASK_STATUS.NOT_STARTED),
  ).length

  return Math.round((completed / safeTasks.length) * 100)
}

export const isTaskOverdue = (task, taskState, today = toDateInput()) => {
  const status = taskState?.status || TASK_STATUS.NOT_STARTED

  if (status === TASK_STATUS.COMPLETED) {
    return false
  }

  return task.deadline < today
}

export const calculateTaskSummary = (tasks, taskProgress, today = toDateInput()) => {
  const safeTasks = Array.isArray(tasks) ? tasks : []
  const progress = taskProgress && typeof taskProgress === 'object' ? taskProgress : {}
  let completed = 0
  let inProgress = 0
  let overdue = 0
  let scoredCount = 0
  let scoreTotal = 0

  safeTasks.forEach((task) => {
    const state = progress[task.id] || {}
    const status = state.status || TASK_STATUS.NOT_STARTED

    if (status === TASK_STATUS.COMPLETED) {
      completed += 1
    }

    if (
      status === TASK_STATUS.IN_PROGRESS ||
      status === TASK_STATUS.SUBMITTED ||
      status === TASK_STATUS.CHECKED ||
      status === TASK_STATUS.NEEDS_FIX
    ) {
      inProgress += 1
    }

    if (task.deadline < today && status !== TASK_STATUS.COMPLETED) {
      overdue += 1
    }

    if (typeof state.score === 'number') {
      scoreTotal += state.score
      scoredCount += 1
    }
  })

  return {
    total: safeTasks.length,
    completed,
    inProgress,
    overdue,
    averageScore: scoredCount ? Math.round(scoreTotal / scoredCount) : 0,
  }
}

export const generateAiReview = (answer, task = null) => {
  const cleanAnswer = answer.trim()
  const length = cleanAnswer.length

  if (length < 30) {
    return {
      score: 50,
      status: TASK_STATUS.NEEDS_FIX,
      comment: 'Ответ слишком короткий. Добавьте больше деталей и объясните решение.',
    }
  }

  if (length <= 100) {
    return {
      score: 70,
      status: TASK_STATUS.CHECKED,
      comment: task
        ? `Ответ принят по заданию «${task.title}», но можно подробнее описать ход решения.`
        : 'Ответ принят, но можно подробнее описать ход решения.',
    }
  }

  return {
    score: 90,
    status: TASK_STATUS.COMPLETED,
    comment: 'Хорошая работа. Ответ достаточно подробный, структура решения понятна.',
  }
}

export const generateAiRecommendation = ({
  overallProgress,
  startedTopics,
  overdueTasks,
}) => {
  if (overallProgress === 0) {
    return 'Выберите направление и начните первый урок.'
  }

  if (startedTopics > 0) {
    return 'Рекомендуем завершить начатые уроки.'
  }

  if (overdueTasks > 0) {
    return 'Обратите внимание на просроченные задания в календаре.'
  }

  if (overallProgress > 70) {
    return 'Отличный результат. Можно переходить к итоговому проекту.'
  }

  return 'Сфокусируйтесь на регулярной практике: завершайте уроки и отправляйте задания после каждого модуля.'
}
