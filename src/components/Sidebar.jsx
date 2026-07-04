import { NavLink } from 'react-router-dom'
import { CheckSquare, DollarSign, FolderKanban, FileText, Star, Zap } from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/tasks',    icon: CheckSquare,   label: 'Tasks' },
  { to: '/finance',  icon: DollarSign,    label: 'Finance' },
  { to: '/projects', icon: FolderKanban,  label: 'Projects' },
  { to: '/notes',    icon: FileText,      label: 'Notes' },
  { to: '/plans',    icon: Star,          label: 'Future Plans' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={20} color="#07070f" fill="#07070f" />
        </div>
        <div className="logo-text">
          <span className="logo-name">AbdoLife</span>
          <span className="logo-sub">Personal OS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} color={isActive ? '#C8F135' : '#6B7280'} />
                <span>{label}</span>
                <div className="link-indicator" />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-info">
          <div className="footer-dot" />
          <span>All data stored locally</span>
        </div>
      </div>
    </aside>
  )
}
