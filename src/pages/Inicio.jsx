import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Ticket, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

const PRIO_CONFIG = {
  alta:  { bg: 'bg-red-100',    text: 'text-red-700',    label: '🔴 Alta'  },
  media: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🟡 Media' },
  baja:  { bg: 'bg-gray-100',   text: 'text-gray-700',   label: '⚪ Baja'  },
}

const ESTADO_LABEL = {
  abierto:            'Abierto',
  en_proceso:         'En proceso',
  esperando_cliente:  'Esperando cliente',
  cerrado:            'Cerrado',
}

export default function Inicio() {
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const [stats, setStats]     = useState({ abiertos: 0, en_proceso: 0, esperando: 0, cerrados_hoy: 0 })
  const [mios, setMios]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    const [{ count: abiertos }, { count: en_proceso }, { count: esperando }, { count: cerrados_hoy }] = await Promise.all([
      supabase.from('pd_tickets').select('*', { count: 'exact', head: true }).eq('estado', 'abierto'),
      supabase.from('pd_tickets').select('*', { count: 'exact', head: true }).eq('estado', 'en_proceso'),
      supabase.from('pd_tickets').select('*', { count: 'exact', head: true }).eq('estado', 'esperando_cliente'),
      supabase.from('pd_tickets').select('*', { count: 'exact', head: true })
        .eq('estado', 'cerrado')
        .gte('cerrado_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    ])
    setStats({
      abiertos:      abiertos     ?? 0,
      en_proceso:    en_proceso   ?? 0,
      esperando:     esperando    ?? 0,
      cerrados_hoy:  cerrados_hoy ?? 0,
    })
    const { data: asignados } = await supabase
      .from('pd_tickets')
      .select('id, numero, titulo, estado, prioridad, pd_clientes(razon_social)')
      .eq('asignado_a', perfil.id)
      .neq('estado', 'cerrado')
      .order('prioridad', { ascending: true })
      .limit(20)
    setMios(asignados ?? [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400">Hola, {perfil.nombre}</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pulso Desk</h1>
        <p className="text-xs text-gray-500 capitalize mt-0.5">{perfil.rol}</p>
      </div>

      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        <Stat icon={AlertCircle}  color="text-red-500"    label="Abiertos"          value={stats.abiertos} />
        <Stat icon={Clock}        color="text-yellow-500" label="En proceso"        value={stats.en_proceso} />
        <Stat icon={Ticket}       color="text-blue-500"   label="Esperando cliente" value={stats.esperando} />
        <Stat icon={CheckCircle2} color="text-emerald-500" label="Cerrados hoy"     value={stats.cerrados_hoy} />
      </div>

      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mis tickets asignados</h2>
        {loading && <p className="text-sm text-gray-500 py-6 text-center">Cargando...</p>}
        {!loading && mios.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 text-center text-sm text-gray-500">
            No tenés tickets asignados.
          </div>
        )}
        <div className="space-y-2">
          {mios.map(t => {
            const prio = PRIO_CONFIG[t.prioridad] ?? PRIO_CONFIG.media
            return (
              <div
                key={t.id}
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 cursor-pointer active:bg-gray-50"
              >
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs text-gray-400">#{t.numero}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prio.bg} ${prio.text}`}>{prio.label}</span>
                  <span className="text-xs text-gray-500">{ESTADO_LABEL[t.estado]}</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.titulo}</p>
                {t.pd_clientes?.razon_social && (
                  <p className="text-xs text-gray-500 truncate">{t.pd_clientes.razon_social}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, color, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}
