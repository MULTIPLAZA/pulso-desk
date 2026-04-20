import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth, puedeEscribirClientes } from '../lib/auth'
import { Search, PlusCircle, Building2, ChevronRight } from 'lucide-react'
import { normalizarTelefono, telefonoCoincide } from '../lib/phone'

const ESTADO_LABEL = {
  activo:    '✅ Activo',
  inactivo:  '⚪ Inactivo',
  prospecto: '🔵 Prospecto',
}

export default function Clientes() {
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase
      .from('pd_clientes')
      .select('id, razon_social, rubro, estado, pd_contactos(id, nombre, telefono)')
      .order('razon_social')
    setClientes(data ?? [])
    setLoading(false)
  }

  const q = busqueda.toLowerCase()
  const qNum = normalizarTelefono(busqueda)
  const filtrados = clientes.filter(c => {
    if (!busqueda) return true
    if (c.razon_social.toLowerCase().includes(q)) return true
    if (c.rubro?.toLowerCase().includes(q))      return true
    if (c.pd_contactos?.some(ct => ct.nombre.toLowerCase().includes(q))) return true
    if (qNum && c.pd_contactos?.some(ct => telefonoCoincide(ct.telefono, busqueda))) return true
    return false
  })

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-800 px-4 pt-14 pb-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{clientes.length} total</span>
            {puedeEscribirClientes(perfil.rol) && (
              <button
                onClick={() => navigate('/clientes/nuevo')}
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
              >
                <PlusCircle size={15} />Nuevo
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Buscar por empresa, teléfono, contacto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      <div className="px-4 py-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {loading && <div className="col-span-full text-center py-10 text-gray-500">Cargando...</div>}

        {!loading && filtrados.length === 0 && (
          <div className="col-span-full text-center py-14 text-gray-500">
            <Building2 size={32} className="mx-auto mb-2 opacity-40" />
            <p>No hay clientes</p>
          </div>
        )}

        {filtrados.map(c => (
          <div
            key={c.id}
            onClick={() => navigate(`/clientes/${c.id}`)}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white truncate">{c.razon_social}</span>
                  <span className="text-xs text-gray-500">{ESTADO_LABEL[c.estado]}</span>
                </div>
                {c.rubro && <p className="text-xs text-gray-500 mt-0.5">{c.rubro}</p>}
                <p className="text-xs text-gray-500 mt-0.5">
                  {c.pd_contactos?.length || 0} contacto{(c.pd_contactos?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
