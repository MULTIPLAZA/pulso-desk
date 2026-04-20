import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { LogOut, Moon, Sun } from 'lucide-react'

const ROL_LABEL = {
  admin:         'Administrador',
  desarrollador: 'Desarrollador',
  soporte:       'Soporte',
}

export default function Mas() {
  const { perfil, signOut } = useAuth()
  const { dark, toggle }    = useTheme()

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Más</h1>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400">Sesión activa</p>
          <p className="font-semibold text-gray-900 dark:text-white">{perfil.nombre}</p>
          <p className="text-sm text-gray-500">{ROL_LABEL[perfil.rol]}</p>
        </div>

        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 text-left"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Modo {dark ? 'claro' : 'oscuro'}
          </span>
        </button>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 text-left text-red-600"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
