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
    const msg = data?.error ?? `Error ${res.status}`
    throw new Error(msg === 'forbidden_not_admin' ? 'Necesitás rol admin' : msg)
  }
  return data
}

export const AdminAPI = {
  listar:     ()      => llamar('GET'),
  crear:      (u)     => llamar('POST',   u),
  actualizar: (patch) => llamar('PATCH',  patch),
  borrar:     (id)    => llamar('DELETE', { id }),
}
