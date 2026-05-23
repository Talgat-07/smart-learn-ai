import { useMemo, useState } from 'react'
import ProgressCard from '../../components/ProgressCard/ProgressCard'
import { useLearning } from '../../context/LearningContext'
import {
  CALENDAR_STATUS,
  CALENDAR_TYPE,
  formatRuDate,
  getCalendarEventClass,
  getCalendarStatusLabel,
  getCalendarTypeLabel,
  getMonthLabel,
  getMonthMatrix,
  isSameDate,
  normalizeDateKey,
  toDateInput,
} from '../../utils/progress'
import './Calendar.scss'

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function Calendar() {
  const {
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    markCalendarEventCompleted,
    completeTask,
  } = useLearning()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(toDateInput())
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    title: '',
    date: toDateInput(),
    type: CALENDAR_TYPE.LESSON,
    status: CALENDAR_STATUS.PLANNED,
  })

  const monthMatrix = useMemo(() => getMonthMatrix(currentMonth), [currentMonth])
  const safeEvents = useMemo(
    () => (Array.isArray(calendarEvents) ? calendarEvents : []),
    [calendarEvents],
  )

  const eventsByDate = useMemo(() => {
    const map = new Map()

    safeEvents.forEach((event) => {
      const key = normalizeDateKey(event.date)

      if (!key) {
        return
      }

      const list = map.get(key) || []
      list.push(event)
      map.set(key, list)
    })

    return map
  }, [safeEvents])

  const selectedEvents = useMemo(
    () => (eventsByDate.get(selectedDate) || []).sort((a, b) => a.title.localeCompare(b.title)),
    [eventsByDate, selectedDate],
  )

  const calendarStats = useMemo(() => {
    const total = safeEvents.length
    const completed = safeEvents.filter(
      (event) => event.status === CALENDAR_STATUS.COMPLETED,
    ).length
    const inProgress = safeEvents.filter(
      (event) => event.status === CALENDAR_STATUS.IN_PROGRESS,
    ).length
    const planned = safeEvents.filter(
      (event) => event.status === CALENDAR_STATUS.PLANNED,
    ).length
    const overdue = safeEvents.filter(
      (event) => event.status === CALENDAR_STATUS.OVERDUE,
    ).length

    return { total, completed, inProgress, planned, overdue }
  }, [safeEvents])

  const resetForm = () => {
    setEditingId(null)
    setForm({
      title: '',
      date: selectedDate,
      type: CALENDAR_TYPE.LESSON,
      status: CALENDAR_STATUS.PLANNED,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setNotice('Введите название события перед сохранением.')
      return
    }

    if (editingId) {
      const updated = updateCalendarEvent(editingId, form)
      setNotice(updated ? 'Событие обновлено.' : 'Не удалось обновить событие.')
      resetForm()
      return
    }

    const added = addCalendarEvent(form)
    setNotice(added ? 'Событие добавлено в календарь.' : 'Некорректная дата события.')
    resetForm()
  }

  const handleEdit = (eventItem) => {
    setEditingId(eventItem.id)
    setForm({
      title: eventItem.title,
      date: normalizeDateKey(eventItem.date),
      type: eventItem.type,
      status: eventItem.status,
    })
  }

  const handleDelete = (eventItem) => {
    const confirmed = window.confirm(`Удалить событие «${eventItem.title}»?`)

    if (!confirmed) {
      return
    }

    deleteCalendarEvent(eventItem.id)
    setNotice('Событие удалено.')
  }

  const handleComplete = (eventItem) => {
    if (eventItem.source === 'deadline' && eventItem.relatedTaskId) {
      const completed = completeTask(eventItem.relatedTaskId)
      setNotice(
        completed
          ? 'Дедлайн закрыт через выполнение задания.'
          : 'Не удалось завершить связанное задание.',
      )
      return
    }

    const completed = markCalendarEventCompleted(eventItem.id)
    setNotice(completed ? 'Событие отмечено выполненным.' : 'Событие не найдено.')
  }

  return (
    <section className='calendar-page'>
      <header className='page-header'>
        <h2 className='page-title'>Календарь отметок</h2>
        <p className='page-subtitle'>Управляйте учебными событиями, дедлайнами и прогрессом по дням.</p>
      </header>

      <div className='calendar-summary'>
        <ProgressCard label='Всего событий' value={calendarStats.total} description='Все записи календаря' />
        <ProgressCard label='Выполнено' value={calendarStats.completed} description='Закрытые события' />
        <ProgressCard label='В процессе' value={calendarStats.inProgress} description='Активные события' />
        <ProgressCard label='Запланировано' value={calendarStats.planned} description='Будущие задачи' />
        <ProgressCard label='Просрочено' value={calendarStats.overdue} description='Требуют внимания' />
      </div>

      {notice ? <p className='calendar-notice'>{notice}</p> : null}

      <div className='calendar-legend'>
        <span className='badge success'>Выполнено</span>
        <span className='badge warning'>В процессе</span>
        <span className='badge danger'>Просрочено</span>
        <span className='badge planned'>Запланировано</span>
        <span className='badge review'>AI / Проверка</span>
      </div>

      <div className='calendar-layout'>
        <article className='calendar-grid surface-card'>
          <div className='calendar-grid__toolbar'>
            <button
              type='button'
              className='ghost-btn'
              onClick={() =>
                setCurrentMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                )
              }
            >
              Предыдущий месяц
            </button>
            <h3>{getMonthLabel(currentMonth)}</h3>
            <button
              type='button'
              className='ghost-btn'
              onClick={() =>
                setCurrentMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                )
              }
            >
              Следующий месяц
            </button>
            <button
              type='button'
              className='secondary-btn'
              onClick={() => {
                setCurrentMonth(new Date())
                setSelectedDate(toDateInput())
              }}
            >
              Сегодня
            </button>
          </div>

          <div className='calendar-grid__weekdays'>
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className='calendar-grid__cells'>
            {monthMatrix.flat().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className='calendar-day calendar-day--empty' />
              }

              const dateKey = normalizeDateKey(date)
              const dayEvents = eventsByDate.get(dateKey) || []
              const isToday = isSameDate(date, new Date())
              const isActive = selectedDate === dateKey

              return (
                <button
                  key={dateKey}
                  type='button'
                  className={`calendar-day${isToday ? ' calendar-day--today' : ''}${isActive ? ' calendar-day--active' : ''}`}
                  onClick={() => {
                    setSelectedDate(dateKey)
                    setForm((prev) => ({ ...prev, date: dateKey }))
                  }}
                >
                  <strong>{date.getDate()}</strong>
                  <small>{dayEvents.length ? `${dayEvents.length} событий` : 'Нет событий'}</small>
                  <div className='calendar-day__chips'>
                    {dayEvents.slice(0, 2).map((eventItem) => (
                      <span key={eventItem.id} className={`badge ${getCalendarEventClass(eventItem)}`}>
                        {getCalendarTypeLabel(eventItem.type)}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </article>

        <aside className='calendar-side'>
          <article className='surface-card calendar-side__panel'>
            <h3>События на {formatRuDate(selectedDate)}</h3>
            {selectedEvents.length === 0 ? (
              <p>На выбранную дату пока нет событий.</p>
            ) : (
              <ul className='calendar-events'>
                {selectedEvents.map((eventItem) => (
                  <li key={eventItem.id}>
                    <div>
                      <strong>{eventItem.title}</strong>
                      <p>
                        <span className={`badge ${getCalendarEventClass(eventItem)}`}>
                          {getCalendarStatusLabel(eventItem.status)}
                        </span>
                        <span className='calendar-events__type'>
                          {getCalendarTypeLabel(eventItem.type)}
                        </span>
                      </p>
                    </div>
                    <div className='calendar-events__actions'>
                      <button type='button' className='secondary-btn' onClick={() => handleComplete(eventItem)}>
                        Выполнено
                      </button>
                      {eventItem.source !== 'deadline' ? (
                        <>
                          <button type='button' className='ghost-btn' onClick={() => handleEdit(eventItem)}>
                            Редактировать
                          </button>
                          <button type='button' className='ghost-btn' onClick={() => handleDelete(eventItem)}>
                            Удалить
                          </button>
                        </>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className='surface-card calendar-side__panel'>
            <h3>{editingId ? 'Редактировать событие' : 'Добавить событие'}</h3>
            <form className='calendar-form' onSubmit={handleSubmit}>
              <label htmlFor='event-title'>Название</label>
              <input
                id='event-title'
                type='text'
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder='Например: Ревью домашнего задания'
              />

              <label htmlFor='event-date'>Дата</label>
              <input
                id='event-date'
                type='date'
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              />

              <label htmlFor='event-type'>Тип</label>
              <select
                id='event-type'
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value={CALENDAR_TYPE.LESSON}>Урок</option>
                <option value={CALENDAR_TYPE.TASK}>Задание</option>
                <option value={CALENDAR_TYPE.DEADLINE}>Дедлайн</option>
                <option value={CALENDAR_TYPE.TEST}>Проверка</option>
                <option value={CALENDAR_TYPE.COMPLETED}>Выполнено</option>
              </select>

              <label htmlFor='event-status'>Статус</label>
              <select
                id='event-status'
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value={CALENDAR_STATUS.PLANNED}>Запланировано</option>
                <option value={CALENDAR_STATUS.IN_PROGRESS}>В процессе</option>
                <option value={CALENDAR_STATUS.COMPLETED}>Выполнено</option>
                <option value={CALENDAR_STATUS.OVERDUE}>Просрочено</option>
              </select>

              <div className='calendar-form__actions'>
                <button type='submit' className='primary-btn'>
                  {editingId ? 'Сохранить' : 'Добавить'}
                </button>

                {editingId ? (
                  <button type='button' className='ghost-btn' onClick={resetForm}>
                    Отмена
                  </button>
                ) : null}
              </div>
            </form>
          </article>
        </aside>
      </div>
    </section>
  )
}

export default Calendar
