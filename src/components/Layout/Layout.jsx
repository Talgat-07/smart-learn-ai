import { Outlet } from 'react-router-dom'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import './Layout.scss'

function Layout() {
  return (
    <div className='app-shell'>
      <Header />
      <div className='layout-body'>
        <Sidebar />
        <main className='page-content'>
          <Outlet />
        </main>
      </div>
      <footer className='app-footer'>
        <p>Smart Learn AI Demo · Образовательная платформа для IT-студентов</p>
      </footer>
    </div>
  )
}

export default Layout
