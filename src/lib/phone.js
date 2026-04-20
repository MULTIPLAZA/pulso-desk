export function normalizarTelefono(tel) {
  if (!tel) return ''
  return tel.replace(/\D/g, '')
}

export function formatearTelefonoPY(tel) {
  const n = normalizarTelefono(tel)
  if (!n) return ''
  if (n.startsWith('595')) {
    const resto = n.slice(3)
    return `+595 ${resto.slice(0, 3)} ${resto.slice(3, 6)} ${resto.slice(6)}`.trim()
  }
  return tel
}

export function linkWhatsApp(tel, mensaje = '') {
  const n = normalizarTelefono(tel)
  const base = n.startsWith('595') ? n : `595${n.replace(/^0+/, '')}`
  const m = mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''
  return `https://wa.me/${base}${m}`
}
