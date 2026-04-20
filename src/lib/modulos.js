// Paleta por módulo — da "alma" con color sin romper la filosofía squared
export const MODULOS = {
  inicio:      { hex: '#0ea5e9', bg: 'bg-sky-600',     light: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-500',     accent: 'bg-sky-500'     },
  tickets:     { hex: '#dc2626', bg: 'bg-red-600',     light: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-500',     accent: 'bg-red-500'     },
  solicitudes: { hex: '#f59e0b', bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-500',   accent: 'bg-amber-500'   },
  ordenes:     { hex: '#6366f1', bg: 'bg-indigo-600',  light: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-500',  accent: 'bg-indigo-500'  },
  clientes:    { hex: '#059669', bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500', accent: 'bg-emerald-500' },
  sistemas:    { hex: '#7c3aed', bg: 'bg-violet-600',  light: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-500',  accent: 'bg-violet-500'  },
  dashboard:   { hex: '#0891b2', bg: 'bg-cyan-600',    light: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-500',    accent: 'bg-cyan-500'    },
}

export function colorModulo(m) {
  return MODULOS[m] ?? MODULOS.inicio
}
