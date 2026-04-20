import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Al montar, intentar refrescar la sesión por si el token expiró mientras la pestaña estaba cerrada
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const expirado = session.expires_at && session.expires_at * 1000 < Date.now() + 60_000
        if (expirado) {
          const { data } = await supabase.auth.refreshSession()
          setSession(data.session)
          if (data.session) cargarPerfil(data.session.user.id)
          else { setPerfil(null); setLoading(false) }
          return
        }
        setSession(session)
        cargarPerfil(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) cargarPerfil(session.user.id)
      else { setPerfil(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function cargarPerfil(userId) {
    const { data } = await supabase
      .from('pd_usuarios_perfil')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setPerfil(data)
    setLoading(false)
  }

  const signIn  = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ session, perfil, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export const ROLES = {
  ADMIN:         'admin',
  DESARROLLADOR: 'desarrollador',
  SOPORTE:       'soporte',
}

export function puedeEscribirClientes(rol) {
  return rol === 'admin' || rol === 'soporte'
}

export function puedeCrearTickets(rol) {
  return rol === 'admin' || rol === 'soporte'
}

export function puedeBorrarTicket(rol) {
  return rol === 'admin'
}
