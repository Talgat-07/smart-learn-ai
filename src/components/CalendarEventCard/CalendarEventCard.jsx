import {
  formatRuDate,
  getCalendarEventClass,
  getCalendarStatusLabel,
  getCalendarTypeLabel,
} from '../../utils/progress'
import './CalendarEventCard.scss'

function CalendarEventCard({ event }) {
  if (!event || typeof event !== 'object') {
    return null
  }

  return (
    <tr className='calendar-row'>
      <td>{formatRuDate(event.date)}</td>
      <td>{event.title}</td>
      <td>{getCalendarTypeLabel(event.type)}</td>
      <td>
        <span className={`badge ${getCalendarEventClass(event)}`}>
          {getCalendarStatusLabel(event.status)}
        </span>
      </td>
      <td>{typeof event.grade === 'number' ? event.grade : '-'}</td>
    </tr>
  )
}

export default CalendarEventCard
