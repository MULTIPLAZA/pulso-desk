import { supabase } from './supabase'

const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-usuarios`

async function llamar(method, body) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Sin sesión activa')
  const res = await fetch(URL, {
    method,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const code = data?.error ?? `error_${res.status}`
    const detail = data?.detail ? ` — ${data.detail}` : ''
    const msg = {
      forbidden_not_admin: 'Necesitás rol admin',
      invalid_token:       'Sesión expirada, refrescá (F5) y volvé a probar',
      perfil_no_existe:    'Tu cuenta no tiene perfil en pd_usuarios_perfil',
      perfil_inactivo:     'Tu perfil está desactivado',
    }[code] ?? code
    throw new Error(msg + detail)
  }
  return data
}

export const AdminAPI = {
  listar:     ()      => llamar('GET'),
  crear:      (u)     => llamar('POST',   u),
  actualizar: (patch) => llamar('PATCH',  patch),
  borrar:     (id)    => llamar('DELETE', { id }),
}
