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

// Quita 0 inicial y prefijo país 595 para comparar núcleos
function nucleoTelefono(tel) {
  let n = normalizarTelefono(tel)
  if (n.startsWith('595')) n = n.slice(3)
  return n.replace(/^0+/, '')
}

// Match fuzzy: considera coincidencia si
// - el query aparece dentro del teléfono completo, o
// - el núcleo del teléfono contiene el núcleo del query, o
// - difieren en ≤ 2 dígitos (números parecidos)
export function telefonoCoincide(telefono, query) {
  if (!telefono || !query) return false
  const tel = normalizarTelefono(telefono)
  const q   = normalizarTelefono(query)
  if (!q) return false
  if (tel.includes(q)) return true

  const nTel = nucleoTelefono(telefono)
  const nQ   = nucleoTelefono(query)
  if (nTel.includes(nQ) || nQ.includes(nTel)) return true

  // Levenshtein sólo si largos similares
  if (Math.abs(nTel.length - nQ.length) > 2) return false
  return distanciaLev(nTel, nQ) <= 2
}

function distanciaLev(a, b) {
  const m = a.length, n = b.length
  if (!m) return n
  if (!n) return m
  const dp = Array.from({ length: m + 1 }, (_, i) => [i])
  for (let j = 1; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[m][n]
}
