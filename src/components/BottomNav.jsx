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
              {/* TEST: hardcoded hex instead of currentColor/CSS var — diagnosing standalone-mode
                  stroke inheritance failure (var() -> currentColor -> SVG stroke) */}
              <Icon size={20} color={isActive ? '#C8F135' : '#4a4a6a'} strokeWidth={2} />
              {/* TEMP DEBUG: visual probe to isolate lucide vs. SVG-in-general vs. container rendering */}
              <span style={{ color: 'red', fontSize: 8 }}>NAV</span>
              {/* TEMP DEBUG: visual probe */}
              <svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="red" /></svg>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
