import { useAuth } from '../lib/auth'
import { ShieldAlert } from 'lucide-react'

export default function SinPerfil() {
  const { session, signOut } = useAuth()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
        <ShieldAlert size={32} className="mx-auto text-yellow-500 mb-3" />
        <p className="font-semibold text-gray-900 dark:text-white mb-1">Cuenta sin perfil asignado</p>
        <p className="text-sm text-gray-500 mb-4">
          {session?.user?.email} necesita que un administrador le asigne un rol en <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">pd_usuarios_perfil</code>.
        </p>
        <button
          onClick={signOut}
          className="w-full py-2.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
