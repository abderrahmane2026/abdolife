import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
