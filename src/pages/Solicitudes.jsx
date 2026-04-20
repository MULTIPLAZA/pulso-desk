import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, PlusCircle, Lightbulb } from 'lucide-react'
import { format } from 'date-fns'

const ESTADO_CFG = {
  pendiente:    { bg: 'bg-gray-100',   text: 'text-gray-700',    label: '⏳ Pendiente'   },
  en_analisis:  { bg: 'bg-blue-100',   text: 'text-blue-700',    label: '🔵 En análisis' },
  aprobado:     { bg: 'bg-emerald-100',text: 'text-emerald-700', label: '✅ Aprobado'    },
  rechazado:    { bg: 'bg-red-100',    text: 'text-red-700',     label: '❌ Rechazado'   },
}

const IMPACTO_CFG = {
  bajo:  { bg: 'bg-gray-50',   text: 'text-gray-600',   emoji: '⚪' },
  medio: { bg: 'bg-yellow-50', text: 'text-yellow-600', emoji: '🟡' },
  alto:  { bg: 'bg-red-50',    text: 'text-red-600',    emoji: '🔴' },
}

const FILTROS = [
  { value: 'activas',     label: 'Activas'     },
  { value: 'pendiente',   label: '⏳ Pendiente' },
  { value: 'en_analisis', label: '🔵 Análisis' },
  { value: 'aprobado',    label: '✅ Aprobadas' },
  { value: 'rechazado',   label: '❌ Rechazadas'},
  { value: 'todas',       label: 'Todas'       },
]

export default function Solicitudes() {
  const navigate = useNavigate()
  const [lista, setLista]       = useState([])
  const [filtro, setFiltro]     = useState('activas')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase
      .from('pd_solicitudes')
      .select('id, numero, titulo, estado, impacto, frecuencia, created_at, pd_clientes(razon_social)')
      .order('frecuencia', { ascending: false })
      .order('created_at', { ascending: false })
    setLista(data ?? [])
    setLoading(false)
  }

  const q = busqueda.toLowerCase()
  const filtradas = lista
    .filter(s => {
      if (filtro === 'todas')   return true
      if (filtro === 'activas') return s.estado === 'pendiente' || s.estado === 'en_analisis'
      return s.estado === filtro
    })
    .filter(s => !busqueda || s.titulo.toLowerCase().includes(q) || s.pd_clientes?.razon_social?.toLowerCase().includes(q))

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-800 px-4 pt-14 pb-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Solicitudes</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{lista.length} total</span>
            <button onClick={() => navigate('/solicitudes/nueva')} className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
              <PlusCircle size={15} />Nueva
            </button>
          </div>
        </div>
        <div className="relative mb-3">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                filtro === f.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {loading && <div className="col-span-full text-center py-10 text-gray-500">Cargando...</div>}
        {!loading && filtradas.length === 0 && (
          <div className="col-span-full text-center py-14 text-gray-500">
            <Lightbulb size={32} className="mx-auto mb-2 opacity-40" />
            <p>Sin solicitudes</p>
          </div>
        )}
        {filtradas.map(s => {
          const e = ESTADO_CFG[s.estado]
          const i = IMPACTO_CFG[s.impacto]
          return (
            <div
              key={s.id}
              onClick={() => navigate(`/solicitudes/${s.id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs text-gray-400">#{s.numero}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.bg} ${e.text}`}>{e.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${i.bg} ${i.text}`}>{i.emoji} {s.impacto}</span>
                {s.frecuencia > 1 && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">× {s.frecuencia}</span>
                )}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.titulo}</p>
              {s.pd_clientes?.razon_social && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{s.pd_clientes.razon_social}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{format(new Date(s.created_at), 'dd/MM/yy')}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
