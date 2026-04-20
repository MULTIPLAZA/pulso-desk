import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { X, Send, Phone, User, Building2, Check } from 'lucide-react'
import { normalizarTelefono, telefonoCoincide, formatearTelefonoPY } from '../lib/phone'

export default function CapturaRapida({ onClose }) {
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const [telefono, setTelefono]       = useState('')
  const [titulo, setTitulo]           = useState('')
  const [prioridad, setPrioridad]     = useState('media')
  const [nombreContacto, setNombreContacto] = useState('')
  const [razonSocial, setRazonSocial]       = useState('')
  const [matches, setMatches]         = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [guardando, setGuardando]     = useState(false)
  const [error, setError]             = useState('')

  // Búsqueda fuzzy en vivo mientras tipean el teléfono
  useEffect(() => {
    const q = normalizarTelefono(telefono)
    if (q.length < 3) { setMatches([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('pd_contactos')
        .select('id, nombre, telefono, cliente_id, pd_clientes(id, razon_social)')
      const found = (data ?? []).filter(c => telefonoCoincide(c.telefono, telefono)).slice(0, 5)
      setMatches(found)
    }, 200)
    return () => clearTimeout(t)
  }, [telefono])

  async function crear() {
    setError('')
    if (!telefono.trim()) { setError('Teléfono requerido'); return }
    if (!titulo.trim())   { setError('Escribí brevemente qué pasó'); return }
    setGuardando(true)
    try {
      let clienteId, contactoId
      if (seleccionado) {
        clienteId  = seleccionado.cliente_id
        contactoId = seleccionado.id
      } else {
        const nombreCli = (razonSocial.trim() || nombreContacto.trim() || 'Sin nombre')
        const { data: cli, error: e1 } = await supabase.from('pd_clientes')
          .insert({ razon_social: nombreCli, estado: 'activo' }).select().single()
        if (e1) throw e1
        clienteId = cli.id
        const { data: ct, error: e2 } = await supabase.from('pd_contactos').insert({
          cliente_id: cli.id,
          nombre:     nombreContacto.trim() || nombreCli,
          telefono,
          principal:  true,
        }).select().single()
        if (e2) throw e2
        contactoId = ct.id
      }
      const { data: tk, error: e3 } = await supabase.from('pd_tickets').insert({
        titulo:      titulo.trim(),
        cliente_id:  clienteId,
        contacto_id: contactoId,
        tipo:        'consulta',
        prioridad,
        estado:      'abierto',
        asignado_a:  perfil.id,
        creado_por:  perfil.id,
      }).select().single()
      if (e3) throw e3
      onClose()
      navigate(`/tickets/${tk.id}`)
    } catch (err) {
      setError(err.message ?? String(err))
      setGuardando(false)
    }
  }

  const telefonoTocado = telefono.trim().length >= 3
  const mostrarFormNuevo = telefonoTocado && matches.length === 0 && !seleccionado

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-lg lg:max-w-md mx-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-lg max-h-[92vh] overflow-y-auto">
        {/* Header coloreado */}
        <div className="bg-red-600 px-5 py-4 rounded-t-lg flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-lg">Captura rápida</p>
            <p className="text-xs text-white/80">Registrá un ticket desde WhatsApp en segundos</p>
          </div>
          <button onClick={onClose} className="text-white/90 p-1"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-3">
          {/* Teléfono */}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">📱 Teléfono del cliente *</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="tel"
                inputMode="tel"
                value={telefono}
                onChange={e => { setTelefono(e.target.value); setSeleccionado(null) }}
                placeholder="0981 234 567"
                className="w-full pl-9 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Coincidencias encontradas */}
          {matches.length > 0 && !seleccionado && (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">💡 Coincidencias encontradas — tocá para usar:</p>
              {matches.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSeleccionado(m); setTelefono(m.telefono) }}
                  className="w-full text-left border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-md p-3 active:bg-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-emerald-700 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-900">{m.nombre}</p>
                    <span className="text-xs text-gray-500">{formatearTelefonoPY(m.telefono)}</span>
                  </div>
                  {m.pd_clientes?.razon_social && (
                    <div className="flex items-center gap-2 mt-0.5 ml-6">
                      <Building2 size={11} className="text-gray-400" />
                      <p className="text-xs text-gray-600">{m.pd_clientes.razon_social}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Confirmación de cliente existente */}
          {seleccionado && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 border-t border-r border-b border-emerald-200 rounded-md p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Check size={16} className="text-emerald-700 mt-0.5" />
                  <div>
                    <p className="text-xs text-emerald-700 font-bold">CLIENTE EXISTENTE</p>
                    <p className="text-sm font-semibold text-gray-900">{seleccionado.nombre}</p>
                    <p className="text-xs text-gray-600">{seleccionado.pd_clientes?.razon_social ?? 'Sin empresa'}</p>
                  </div>
                </div>
                <button onClick={() => { setSeleccionado(null); setTelefono('') }} className="text-xs text-gray-500 underline flex-shrink-0">
                  Cambiar
                </button>
              </div>
            </div>
          )}

          {/* Form rápido para cliente NUEVO */}
          {mostrarFormNuevo && (
            <div className="bg-amber-50 border-l-4 border-amber-500 border-t border-r border-b border-amber-200 rounded-md p-3 space-y-2">
              <p className="text-xs text-amber-800 font-bold">🆕 CLIENTE NUEVO — se crea junto con el ticket</p>
              <input
                placeholder="Nombre de quien escribe (ej: Juan)"
                value={nombreContacto}
                onChange={e => setNombreContacto(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                placeholder="Empresa / negocio (opcional)"
                value={razonSocial}
                onChange={e => setRazonSocial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-amber-700">💡 Si no sabés el nombre de la empresa, dejalo vacío y lo completás después.</p>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">💬 ¿Qué pasó? *</label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: No imprime el ticket tras actualizar"
              className="w-full px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">🎯 Prioridad</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'baja',  label: '⚪ Baja',  color: 'bg-gray-100 text-gray-700 border-gray-200'  },
                { v: 'media', label: '🟡 Media', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { v: 'alta',  label: '🔴 Alta',  color: 'bg-red-50 text-red-700 border-red-200' },
              ].map(p => (
                <button
                  key={p.v}
                  type="button"
                  onClick={() => setPrioridad(p.v)}
                  className={`py-2 rounded-md text-sm font-semibold border-2 ${
                    prioridad === p.v ? (p.v === 'alta' ? 'border-red-500 bg-red-100 text-red-800' : p.v === 'media' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-gray-400 bg-gray-200 text-gray-800') : p.color
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={crear}
            disabled={guardando || !telefono.trim() || !titulo.trim()}
            className="w-full py-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-base font-bold disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
          >
            <Send size={16} />{guardando ? 'Creando...' : 'Crear ticket ahora'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Tipo: consulta · Estado: abierto · Asignado a {perfil.nombre}
          </p>
        </div>
      </div>
    </div>
  )
}
