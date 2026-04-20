import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, Ticket, Lightbulb, ClipboardList, BarChart3, MoreHorizontal, PlusCircle } from 'lucide-react'

const mainItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Inicio'      },
  { to: '/tickets',     icon: Ticket,          label: 'Tickets'     },
  { to: '/solicitudes', icon: Lightbulb,       label: 'Solicitudes' },
  { to: '/ordenes',     icon: ClipboardList,   label: 'Órdenes'     },
  { to: '/clientes',    icon: Building2,       label: 'Clientes'    },
]

const moreItems = [
  { to: '/dashboard',     icon: BarChart3,      label: 'Dashboard' },
  { to: '/tickets/nuevo', icon: PlusCircle,     label: 'Nuevo ticket' },
  { to: '/mas',           icon: MoreHorizontal, label: 'Más'       },
]

function Item({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 font-semibold'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }`
      }
    >
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col z-40">
      <div className="px-5 py-6 border-b border-gray-100 dark:border-gray-700">
        <p className="text-lg font-bold text-gray-900 dark:text-white">Pulso</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Desk</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {mainItems.map(it => <Item key={it.to} {...it} />)}
        <div className="my-3 border-t border-gray-100 dark:border-gray-700" />
        {moreItems.map(it => <Item key={it.to} {...it} />)}
      </nav>
    </aside>
  )
}
