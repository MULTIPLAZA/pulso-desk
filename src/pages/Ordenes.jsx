import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Search, PlusCircle, ClipboardList, AlertTriangle } from 'lucide-react'
import { SISTEMAS, ESTADO_CFG, PRIO_CFG, diasDesde, diasTexto, colorDias } from '../lib/ordenes'

const FILTROS_ESTADO = [
  { value: 'activas',     label: 'Activas'      },
  { value: 'pendiente',   label: '⏳ Pendiente'  },
  { value: 'en_progreso', label: '🛠 En progreso' },
  { value: 'terminado',   label: '✅ Terminadas'  },
  { value: 'todas',       label: 'Todas'        },
]

export default function Ordenes() {
  const navigate    = useNavigate()
  const { perfil }  = useAuth()
  const [lista, setLista]       = useState([])
  const [usuarios, setUsuarios] = useState({})
  const [estado, setEstado]     = useState('activas')
  const [sistema, setSistema]   = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const [{ data: ords }, { data: us }] = await Promise.all([
      supabase.from('pd_ordenes').select('id, numero, titulo, funcionalidad, sistema, estado, prioridad, complejidad, asignado_a, created_at, fecha_objetivo').order('created_at', { ascending: false }),
      supabase.from('pd_usuarios_perfil').select('id, nombre'),
    ])
    setLista(ords ?? [])
    setUsuarios(Object.fromEntries((us ?? []).map(u => [u.id, u.nombre])))
    setLoading(false)
  }

  const puedeCrear = perfil.rol === 'admin' || perfil.rol === 'desarrollador'

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase()
    return lista
      .filter(o => {
        if (estado === 'todas')    return true
        if (estado === 'activas')  return o.estado !== 'terminado'
        return o.estado === estado
      })
      .filter(o => !sistema  || o.sistema === sistema)
      .filter(o => {
        if (!busqueda) return true
        return (o.titulo?.toLowerCase().includes(q))
            || (o.funcionalidad?.toLowerCase().includes(q))
            || String(o.numero).includes(busqueda)
      })
      .sort((a, b) => {
        // activos primero, luego terminados
        const aTerm = a.estado === 'terminado' ? 1 : 0
        const bTerm = b.estado === 'terminado' ? 1 : 0
        if (aTerm !== bTerm) return aTerm - bTerm
        // dentro de activos: prioridad alta primero
        const pa = PRIO_CFG[a.prioridad]?.orden ?? 9
        const pb = PRIO_CFG[b.prioridad]?.orden ?? 9
        if (pa !== pb) return pa - pb
        // a igual prioridad, más antiguas primero (más urgente)
        return new Date(a.created_at) - new Date(b.created_at)
      })
  }, [lista, estado, sistema, busqueda])

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

        <div className="relative mb-3">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Buscar por título, funcionalidad o #..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-2">
          {FILTROS_ESTADO.map(f => (
            <button
              key={f.value}
              onClick={() => setEstado(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                estado === f.value ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSistema('')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
              !sistema ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Todos los sistemas
          </button>
          {SISTEMAS.map(s => (
            <button
              key={s}
              onClick={() => setSistema(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                sistema === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
        {loading && <div className="col-span-full text-center py-10 text-gray-500">Cargando...</div>}
        {!loading && filtradas.length === 0 && (
          <div className="col-span-full text-center py-14 text-gray-500">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
            <p>Sin órdenes</p>
          </div>
        )}

        {filtradas.map(o => {
          const e = ESTADO_CFG[o.estado] ?? ESTADO_CFG.pendiente
          const p = PRIO_CFG[o.prioridad] ?? PRIO_CFG.media
          const d = diasDesde(o.created_at)
          const colorD = colorDias(d, o.estado)
          const vencida = o.fecha_objetivo && new Date(o.fecha_objetivo) < new Date() && o.estado !== 'terminado'
          return (
            <div
              key={o.id}
              onClick={() => navigate(`/ordenes/${o.id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-xs text-gray-400">#{o.numero}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.bg} ${e.text}`}>{e.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.bg} ${p.text}`}>{p.emoji} {o.prioridad}</span>
                {o.sistema && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{o.sistema}</span>
                )}
                {vencida && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><AlertTriangle size={10} />Vencida</span>
                )}
              </div>

              <p className="font-semibold text-gray-900 dark:text-white text-sm">{o.titulo}</p>
              {o.funcionalidad && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{o.funcionalidad}</p>
              )}

              <div className="flex items-center justify-between mt-2 text-xs">
                <span className={colorD}>{diasTexto(d)}</span>
                {o.asignado_a && (
                  <span className="text-gray-500">👤 {usuarios[o.asignado_a] ?? 'Asignado'}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
