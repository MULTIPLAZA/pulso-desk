import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Ticket, PlusCircle, Building2, MoreHorizontal } from 'lucide-react'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Inicio'   },
  { to: '/tickets',       icon: Ticket,          label: 'Tickets'  },
  { to: '/tickets/nuevo', icon: PlusCircle,      label: 'Nuevo'    },
  { to: '/clientes',      icon: Building2,       label: 'Clientes' },
  { to: '/mas',           icon: MoreHorizontal,  label: 'Más'      },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex z-50 max-w-lg mx-auto lg:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-500'
            }`
          }
        >
          <Icon size={22} strokeWidth={1.8} />
          <span className="mt-0.5">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
