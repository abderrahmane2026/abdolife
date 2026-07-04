import { NavLink } from 'react-router-dom'
import { CheckSquare, DollarSign, FolderKanban, FileText, Star } from 'lucide-react'
import './BottomNav.css'

const NAV_ITEMS = [
  { to: '/tasks',    icon: CheckSquare,  label: 'Tasks' },
  { to: '/finance',  icon: DollarSign,   label: 'Finance' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/notes',    icon: FileText,     label: 'Notes' },
  { to: '/plans',    icon: Star,         label: 'Plans' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-nav-link${isActive ? ' active' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={24} color={isActive ? '#C8F135' : '#6B7280'} strokeWidth={2} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
