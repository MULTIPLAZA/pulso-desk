export const SISTEMAS = [
  'POS',
  'SIFEN Engine',
  'Panel Web',
  'XMLBox',
  'CRM-Contactos',
  'Pulso Desk',
  'Otro',
]

export const ESTADO_CFG = {
  pendiente:   { bg: 'bg-gray-100',    text: 'text-gray-700',     label: '⏳ Pendiente'   },
  en_progreso: { bg: 'bg-yellow-100',  text: 'text-yellow-700',   label: '🛠 En progreso' },
  terminado:   { bg: 'bg-emerald-100', text: 'text-emerald-700',  label: '✅ Terminado'   },
}

export const PRIO_CFG = {
  alta:  { bg: 'bg-red-50',    text: 'text-red-600',    emoji: '🔴', orden: 0 },
  media: { bg: 'bg-yellow-50', text: 'text-yellow-600', emoji: '🟡', orden: 1 },
  baja:  { bg: 'bg-gray-50',   text: 'text-gray-600',   emoji: '⚪', orden: 2 },
}

export function diasDesde(fechaIso) {
  if (!fechaIso) return 0
  return Math.floor((Date.now() - new Date(fechaIso).getTime()) / 86400000)
}

export function diasTexto(d) {
  if (d <= 0)  return 'Hoy'
  if (d === 1) return 'Ayer'
  return `Hace ${d} días`
}

// Rojo si pasó mucho tiempo sin terminar; no aplica a terminadas
export function colorDias(d, estado) {
  if (estado === 'terminado') return 'text-gray-400'
  if (d >= 14) return 'text-red-600 font-semibold'
  if (d >= 7)  return 'text-orange-600'
  return 'text-gray-500'
}
