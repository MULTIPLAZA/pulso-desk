import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth, puedeCrearTickets } from '../lib/auth'
import CapturaRapida from './CapturaRapida'

// Ocultar el FAB en rutas donde ya hay un formulario de creación/edición abierto
const RUTAS_OCULTAS = ['/nuevo', '/nueva', '/editar', '/login']

export default function FabCaptura() {
  const [abierto, setAbierto] = useState(false)
  const { pathname } = useLocation()
  const { perfil } = useAuth()

  if (!perfil || !puedeCrearTickets(perfil.rol)) return null
  if (RUTAS_OCULTAS.some(r => pathname.endsWith(r) || pathname.includes(r + '/'))) return null

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        aria-label="Captura rápida de ticket"
        title="Captura rápida de ticket"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-md shadow-xl flex items-center justify-center active:bg-red-800 transition-transform active:scale-95"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
      {abierto && <CapturaRapida onClose={() => setAbierto(false)} />}
    </>
  )
}
