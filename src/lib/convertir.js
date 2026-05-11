import { supabase } from './supabase'

export const RUTAS = {
  ticket: '/tickets',
  orden:  '/ordenes',
}

export const LABELS = {
  ticket: 'Ticket',
  orden:  'Orden de trabajo',
}

// Qué se pierde al convertir de A a B
export const PERDIDAS = {
  ticket: {
    orden: ['Mensajes del timeline', 'Etiquetas', 'Contacto', 'Cliente vinculado', 'Tipo', 'Frecuencia', 'Estado actual'],
  },
  orden: {
    ticket: ['Bitácora de observaciones', 'Complejidad', 'Fecha objetivo', 'Funcionalidad', 'Estado actual'],
  },
}

// Cambios de campo notables (informativos, no son pérdidas)
export const TRANSFORMACIONES = {
  ticket: {
    orden: ['Descripción → Descripción técnica', 'Prioridad se mantiene', 'Asignación se mantiene', 'Sistema se mantiene'],
  },
  orden: {
    ticket: ['Descripción técnica → Descripción', 'Prioridad se mantiene', 'Asignación se mantiene', 'Sistema se mantiene'],
  },
}

/**
 * Convierte un registro entre tablas. INSERT primero, DELETE después.
 * Si DELETE falla queda el origen — el caller debe surfaceárselo al usuario.
 * @returns {Promise<{ id: string, tipo: 'ticket'|'orden' }>}
 */
export async function convertir(tipoOrigen, tipoDestino, registro, perfilId) {
  const fn = HANDLERS[`${tipoOrigen}__${tipoDestino}`]
  if (!fn) throw new Error(`Conversión no soportada: ${tipoOrigen} → ${tipoDestino}`)
  return fn(registro, perfilId)
}

const HANDLERS = {
  async ticket__orden(t, perfilId) {
    const { data, error } = await supabase.from('pd_ordenes').insert({
      titulo:              t.titulo,
      descripcion_tecnica: t.descripcion,
      sistema_id:          t.sistema_id,
      prioridad:           t.prioridad,
      asignado_a:          t.asignado_a,
      complejidad:         'media',
      estado:              'pendiente',
      creado_por:          perfilId,
    }).select('id').single()
    if (error) throw error
    const { error: errDel } = await supabase.from('pd_tickets').delete().eq('id', t.id)
    if (errDel) throw errDel
    return { id: data.id, tipo: 'orden' }
  },

  async orden__ticket(o, perfilId) {
    const { data, error } = await supabase.from('pd_tickets').insert({
      titulo:      o.titulo,
      descripcion: o.descripcion_tecnica,
      sistema_id:  o.sistema_id,
      prioridad:   o.prioridad,
      asignado_a:  o.asignado_a,
      tipo:        'consulta',
      estado:      'abierto',
      creado_por:  perfilId,
    }).select('id').single()
    if (error) throw error
    const { error: errDel } = await supabase.from('pd_ordenes').delete().eq('id', o.id)
    if (errDel) throw errDel
    return { id: data.id, tipo: 'ticket' }
  },
}
