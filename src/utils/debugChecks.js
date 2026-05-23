const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const hasDuplicateIds = (items) => {
  const seen = new Set()
  const duplicates = []

  items.forEach((item) => {
    const id = item?.id

    if (!id) {
      return
    }

    if (seen.has(id)) {
      duplicates.push(id)
      return
    }

    seen.add(id)
  })

  return duplicates
}

const isValidDateString = (value) => {
  if (typeof value !== 'string') {
    return false
  }

  const match = /^\d{4}-\d{2}-\d{2}$/.test(value)
  if (!match) {
    return false
  }

  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

export const checkDirectionsData = (directions) => {
  const warnings = []

  if (!Array.isArray(directions)) {
    warnings.push('directions: ожидается массив направлений.')
    return warnings
  }

  directions.forEach((direction, index) => {
    if (!isPlainObject(direction)) {
      warnings.push(`directions[${index}]: ожидается объект.`)
      return
    }

    if (!direction.id) {
      warnings.push(`directions[${index}]: отсутствует id.`)
    }

    if (!direction.title) {
      warnings.push(`directions[${index}]: отсутствует title.`)
    }
  })

  const duplicates = hasDuplicateIds(directions)
  if (duplicates.length > 0) {
    warnings.push(`directions: найдены дубли id (${duplicates.join(', ')}).`)
  }

  return warnings
}

export const checkTopicsData = (learningPlans, directions) => {
  const warnings = []

  if (!isPlainObject(learningPlans)) {
    warnings.push('learningPlans: ожидается объект вида { directionId: topics[] }.')
    return warnings
  }

  const directionIds = new Set(Array.isArray(directions) ? directions.map((item) => item.id) : [])
  const allTopics = []

  Object.entries(learningPlans).forEach(([directionId, topics]) => {
    if (!directionIds.has(directionId)) {
      warnings.push(`learningPlans.${directionId}: направление не найдено в directions.`)
    }

    if (!Array.isArray(topics)) {
      warnings.push(`learningPlans.${directionId}: ожидается массив тем.`)
      return
    }

    topics.forEach((topic, index) => {
      if (!isPlainObject(topic)) {
        warnings.push(`learningPlans.${directionId}[${index}]: ожидается объект темы.`)
        return
      }

      if (!topic.id) {
        warnings.push(`learningPlans.${directionId}[${index}]: отсутствует id.`)
      }

      if (!topic.directionId) {
        warnings.push(`learningPlans.${directionId}[${index}]: отсутствует directionId.`)
      } else if (topic.directionId !== directionId) {
        warnings.push(
          `learningPlans.${directionId}[${index}]: directionId (${topic.directionId}) не совпадает с ключом ${directionId}.`,
        )
      }

      allTopics.push(topic)
    })
  })

  const duplicates = hasDuplicateIds(allTopics)
  if (duplicates.length > 0) {
    warnings.push(`topics: найдены дубли id (${duplicates.join(', ')}).`)
  }

  return warnings
}

export const checkTasksData = (tasks, directions, learningPlans) => {
  const warnings = []

  if (!Array.isArray(tasks)) {
    warnings.push('tasks: ожидается массив заданий.')
    return warnings
  }

  const directionIds = new Set(Array.isArray(directions) ? directions.map((item) => item.id) : [])
  const topicIds = new Set(
    isPlainObject(learningPlans)
      ? Object.values(learningPlans).flat().map((topic) => topic.id)
      : [],
  )

  tasks.forEach((task, index) => {
    if (!isPlainObject(task)) {
      warnings.push(`tasks[${index}]: ожидается объект.`)
      return
    }

    if (!task.id) {
      warnings.push(`tasks[${index}]: отсутствует id.`)
    }

    if (!task.directionId || !directionIds.has(task.directionId)) {
      warnings.push(`tasks[${index}]: directionId (${task.directionId}) не найден.`)
    }

    if (!task.topicId || !topicIds.has(task.topicId)) {
      warnings.push(`tasks[${index}]: topicId (${task.topicId}) не найден.`)
    }

    if (!isValidDateString(task.deadline)) {
      warnings.push(`tasks[${index}]: некорректный deadline (${task.deadline}).`)
    }
  })

  const duplicates = hasDuplicateIds(tasks)
  if (duplicates.length > 0) {
    warnings.push(`tasks: найдены дубли id (${duplicates.join(', ')}).`)
  }

  return warnings
}

export const checkCalendarEventsData = (events, tasks, learningPlans) => {
  const warnings = []

  if (!Array.isArray(events)) {
    warnings.push('calendarEvents: ожидается массив событий.')
    return warnings
  }

  const taskIds = new Set(Array.isArray(tasks) ? tasks.map((task) => task.id) : [])
  const topicIds = new Set(
    isPlainObject(learningPlans)
      ? Object.values(learningPlans).flat().map((topic) => topic.id)
      : [],
  )

  events.forEach((event, index) => {
    if (!isPlainObject(event)) {
      warnings.push(`calendarEvents[${index}]: ожидается объект.`)
      return
    }

    if (!event.id) {
      warnings.push(`calendarEvents[${index}]: отсутствует id.`)
    }

    if (!event.title) {
      warnings.push(`calendarEvents[${index}]: отсутствует title.`)
    }

    if (!isValidDateString(event.date)) {
      warnings.push(`calendarEvents[${index}]: некорректная дата (${event.date}).`)
    }

    if (event.relatedTaskId && !taskIds.has(event.relatedTaskId)) {
      warnings.push(`calendarEvents[${index}]: relatedTaskId (${event.relatedTaskId}) не найден.`)
    }

    if (event.relatedTopicId && !topicIds.has(event.relatedTopicId)) {
      warnings.push(`calendarEvents[${index}]: relatedTopicId (${event.relatedTopicId}) не найден.`)
    }
  })

  const duplicates = hasDuplicateIds(events)
  if (duplicates.length > 0) {
    warnings.push(`calendarEvents: найдены дубли id (${duplicates.join(', ')}).`)
  }

  return warnings
}

export const runDebugChecks = ({ directions, learningPlans, tasks, calendarEvents }) => {
  const warnings = [
    ...checkDirectionsData(directions),
    ...checkTopicsData(learningPlans, directions),
    ...checkTasksData(tasks, directions, learningPlans),
    ...checkCalendarEventsData(calendarEvents, tasks, learningPlans),
  ]

  warnings.forEach((warning) => {
    console.warn(`[SmartLearn debug] ${warning}`)
  })

  return warnings
}
