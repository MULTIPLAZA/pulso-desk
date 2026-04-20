// Edge Function: admin-usuarios
// Gestiona creación/listado/borrado de usuarios de Pulso Desk.
// Solo usuarios con rol 'admin' pueden usarla.

import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // --- Validar que el caller sea admin
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'missing_authorization' }, 401)
  const jwt = authHeader.replace(/^Bearer\s+/i, '')

  // Cliente con service role — para leer perfil saltándose RLS
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: { user }, error: errUser } = await admin.auth.getUser(jwt)
  if (errUser || !user) {
    return json({ error: 'invalid_token', detail: errUser?.message ?? 'no user' }, 401)
  }

  const { data: perfil, error: errPerfil } = await admin
    .from('pd_usuarios_perfil')
    .select('rol, activo')
    .eq('id', user.id)
    .maybeSingle()
  if (errPerfil) return json({ error: 'profile_query_failed', detail: errPerfil.message }, 500)
  if (!perfil)             return json({ error: 'perfil_no_existe',      detail: `Usuario ${user.email} no tiene perfil en pd_usuarios_perfil` }, 403)
  if (!perfil.activo)      return json({ error: 'perfil_inactivo',        detail: 'Tu perfil fue desactivado' }, 403)
  if (perfil.rol !== 'admin') {
    return json({ error: 'forbidden_not_admin', detail: `Tu rol es "${perfil.rol}", solo admin puede gestionar usuarios` }, 403)
  }

  try {
    // ==========================================
    // GET → lista todos los usuarios con email
    // ==========================================
    if (req.method === 'GET') {
      const { data: perfiles, error: e1 } = await admin
        .from('pd_usuarios_perfil')
        .select('id, nombre, rol, activo, created_at')
        .order('nombre')
      if (e1) return json({ error: e1.message }, 500)

      const { data: listUsers, error: e2 } = await admin.auth.admin.listUsers({ perPage: 200 })
      if (e2) return json({ error: e2.message }, 500)
      const emailMap: Record<string, string> = {}
      listUsers.users.forEach(u => { if (u.email) emailMap[u.id] = u.email })

      const resultado = (perfiles ?? []).map(p => ({ ...p, email: emailMap[p.id] ?? null }))
      return json(resultado)
    }

    // ==========================================
    // POST → crear usuario (auth + perfil)
    // Body: { email, password, nombre, rol }
    // ==========================================
    if (req.method === 'POST') {
      const { email, password, nombre, rol } = await req.json()
      if (!email || !password || !nombre || !rol) {
        return json({ error: 'missing_fields' }, 400)
      }
      if (!['admin', 'desarrollador', 'soporte'].includes(rol)) {
        return json({ error: 'rol_invalido' }, 400)
      }

      const { data: creado, error: e1 } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
      })
      if (e1) return json({ error: e1.message }, 400)

      const { error: e2 } = await admin.from('pd_usuarios_perfil').insert({
        id:     creado.user.id,
        nombre, rol,
        activo: true,
      })
      if (e2) {
        // rollback — borrar el auth user que creamos
        await admin.auth.admin.deleteUser(creado.user.id)
        return json({ error: e2.message }, 400)
      }
      return json({ ok: true, id: creado.user.id, email: creado.user.email })
    }

    // ==========================================
    // PATCH → cambiar rol/activo o password
    // Body: { id, nombre?, rol?, activo?, password? }
    // ==========================================
    if (req.method === 'PATCH') {
      const { id, nombre, rol, activo, password } = await req.json()
      if (!id) return json({ error: 'missing_id' }, 400)

      // Bloquear que se auto-desactive o se saque su propio rol admin
      if (id === user.id && (activo === false || (rol && rol !== 'admin'))) {
        return json({ error: 'no_te_podes_desactivar_a_vos_mismo' }, 400)
      }

      const patchPerfil: Record<string, unknown> = {}
      if (nombre !== undefined) patchPerfil.nombre = nombre
      if (rol    !== undefined) {
        if (!['admin', 'desarrollador', 'soporte'].includes(rol)) {
          return json({ error: 'rol_invalido' }, 400)
        }
        patchPerfil.rol = rol
      }
      if (activo !== undefined) patchPerfil.activo = activo

      if (Object.keys(patchPerfil).length > 0) {
        const { error } = await admin.from('pd_usuarios_perfil').update(patchPerfil).eq('id', id)
        if (error) return json({ error: error.message }, 400)
      }

      if (password) {
        const { error } = await admin.auth.admin.updateUserById(id, { password })
        if (error) return json({ error: error.message }, 400)
      }

      return json({ ok: true })
    }

    // ==========================================
    // DELETE → elimina auth user + perfil
    // Body: { id }
    // ==========================================
    if (req.method === 'DELETE') {
      const { id } = await req.json()
      if (!id) return json({ error: 'missing_id' }, 400)
      if (id === user.id) return json({ error: 'no_te_podes_borrar_a_vos_mismo' }, 400)

      // El perfil se borra solo por ON DELETE CASCADE, pero por las dudas:
      await admin.from('pd_usuarios_perfil').delete().eq('id', id)
      const { error } = await admin.auth.admin.deleteUser(id)
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    return json({ error: 'method_not_allowed' }, 405)
  } catch (err) {
    return json({ error: (err as Error).message ?? 'server_error' }, 500)
  }
})
