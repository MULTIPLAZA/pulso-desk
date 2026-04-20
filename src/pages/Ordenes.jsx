import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Search, PlusCircle, ClipboardList } from 'lucide-react'

const COLS = [
  { key: 'backlog',     label: 'Backlog',     color: 'border-gray-300' },
  { key: 'en_progreso', label: 'En progreso', color: 'border-yellow-400' },
  { key: 'terminado',   label: 'Terminado',   color: 'border-emerald-400' },
]

const COMP_CFG = {
  baja:  { bg: 'bg-gray-50',   text: 'text-gray-600' },
  media: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  alta:  { bg: 'bg-red-50',    text: 'text-red-700' },
}

export default function Ordenes() {
  const navigate    = useNavigate()
  const { perfil }  = useAuth()
  const [lista, setLista]     = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState({})

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const [{ data: ords }, { data: us }] = await Promise.all([
      supabase.from('pd_ordenes').select('id, numero, titulo, estado, prioridad, complejidad, asignado_a').order('created_at', { ascending: false }),
      supabase.from('pd_usuarios_perfil').select('id, nombre'),
    ])
    setLista(ords ?? [])
    setUsuarios(Object.fromEntries((us ?? []).map(u => [u.id, u.nombre])))
    setLoading(false)
  }

  const q = busqueda.toLowerCase()
  const filtradas = lista.filter(o => !busqueda || o.titulo.toLowerCase().includes(q) || String(o.numero).includes(busqueda))
  const puedeCrear = perfil.rol === 'admin' || perfil.rol === 'desarrollador'

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-800 px-4 pt-14 pb-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Órdenes de trabajo</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{lista.length} total</span>
            {puedeCrear && (
              <button onClick={() => navigate('/ordenes/nueva')} className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <PlusCircle size={15} />Nueva
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      <div className="p-4">
        {loading && <p className="text-center text-gray-500 py-10">Cargando...</p>}
        {!loading && lista.length === 0 && (
          <div className="text-center py-14 text-gray-500">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
            <p>Sin órdenes aún</p>
          </div>
        )}
        {!loading && lista.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {COLS.map(col => {
              const items = filtradas.filter(o => o.estado === col.key)
              return (
                <div key={col.key} className={`bg-white dark:bg-gray-800 rounded-lg p-3 border-t-4 ${col.color} border-x border-b border-gray-100 dark:border-gray-700`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{col.label}</p>
                    <span className="text-xs text-gray-500">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(o => {
                      const c = COMP_CFG[o.complejidad]
                      return (
                        <div
                          key={o.id}
                          onClick={() => navigate(`/ordenes/${o.id}`)}
                          className="border border-gray-100 dark:border-gray-700 rounded-md p-3 cursor-pointer active:bg-gray-50"
                        >
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs text-gray-400">#{o.numero}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{o.complejidad}</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white font-medium">{o.titulo}</p>
                          {o.asignado_a && (
                            <p className="text-xs text-gray-500 mt-0.5">👤 {usuarios[o.asignado_a] ?? 'Asignado'}</p>
                          )}
                        </div>
                      )
                    })}
                    {items.length === 0 && <p className="text-xs text-gray-400 text-center py-3">Vacío</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
