import { NavLink } from 'react-router-dom'
import './Sidebar.scss'

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/directions', label: 'Направления' },
  { to: '/plan', label: 'План обучения' },
  { to: '/tasks', label: 'Задания' },
  { to: '/ai-assistant', label: 'AI-помощник' },
  { to: '/calendar', label: 'Календарь' },
  { to: '/profile', label: 'Мой прогресс' },
]

function Sidebar() {
  return (
    <aside className='sidebar'>
      <p className='sidebar__title'>Навигация</p>
      <nav className='sidebar__nav'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
