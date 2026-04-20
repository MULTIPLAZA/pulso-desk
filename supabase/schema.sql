-- =============================================
-- Pulso Desk — Schema Supabase (Fase 1)
-- Ejecutar en: Supabase > SQL Editor
-- Convive con CRM-contactos en la misma DB sin tocar sus tablas.
-- Todas las tablas llevan prefijo pd_ para aislamiento total.
-- =============================================

-- =============================================
-- 0. Perfiles de usuario interno (roles)
-- =============================================
CREATE TABLE pd_usuarios_perfil (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  rol        TEXT CHECK (rol IN ('admin', 'desarrollador', 'soporte')) NOT NULL,
  activo     BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helper: rol del usuario actual
CREATE OR REPLACE FUNCTION pd_rol_actual()
RETURNS TEXT AS $$
  SELECT rol FROM pd_usuarios_perfil WHERE id = auth.uid() AND activo = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Trigger genérico para updated_at
CREATE OR REPLACE FUNCTION pd_tg_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 1. Clientes (empresas) — separado del CRM
-- =============================================
CREATE TABLE pd_clientes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razon_social  TEXT NOT NULL,
  rubro         TEXT,
  estado        TEXT CHECK (estado IN ('activo', 'inactivo', 'prospecto')) DEFAULT 'activo',
  ruc           TEXT,
  direccion     TEXT,
  notas         TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER pd_clientes_updated_at
  BEFORE UPDATE ON pd_clientes
  FOR EACH ROW EXECUTE FUNCTION pd_tg_updated_at();

CREATE INDEX idx_pd_clientes_estado ON pd_clientes(estado);
CREATE INDEX idx_pd_clientes_razon  ON pd_clientes(lower(razon_social));

-- =============================================
-- 2. Contactos por cliente (N:1) — múltiples WA
-- =============================================
CREATE TABLE pd_contactos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id   UUID REFERENCES pd_clientes(id) ON DELETE CASCADE NOT NULL,
  nombre       TEXT NOT NULL,
  telefono     TEXT NOT NULL,
  rol          TEXT,
  principal    BOOLEAN DEFAULT false,
  notas        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pd_contactos_cliente  ON pd_contactos(cliente_id);
CREATE INDEX idx_pd_contactos_telefono ON pd_contactos(telefono);

-- =============================================
-- 3. Etiquetas (tags reutilizables en tickets)
-- =============================================
CREATE TABLE pd_etiquetas (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre     TEXT UNIQUE NOT NULL,
  color      TEXT DEFAULT '#059669',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. Tickets de soporte
-- =============================================
CREATE TABLE pd_tickets (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero        SERIAL UNIQUE,
  cliente_id    UUID REFERENCES pd_clientes(id) ON DELETE SET NULL,
  contacto_id   UUID REFERENCES pd_contactos(id) ON DELETE SET NULL,
  titulo        TEXT NOT NULL,
  descripcion   TEXT,
  tipo          TEXT CHECK (tipo IN ('incidente', 'consulta', 'soporte_tecnico')) DEFAULT 'consulta',
  estado        TEXT CHECK (estado IN ('abierto', 'en_proceso', 'esperando_cliente', 'cerrado')) DEFAULT 'abierto',
  prioridad     TEXT CHECK (prioridad IN ('baja', 'media', 'alta')) DEFAULT 'media',
  asignado_a    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creado_por    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cerrado_at    TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER pd_tickets_updated_at
  BEFORE UPDATE ON pd_tickets
  FOR EACH ROW EXECUTE FUNCTION pd_tg_updated_at();

CREATE INDEX idx_pd_tickets_cliente    ON pd_tickets(cliente_id);
CREATE INDEX idx_pd_tickets_estado     ON pd_tickets(estado);
CREATE INDEX idx_pd_tickets_prioridad  ON pd_tickets(prioridad);
CREATE INDEX idx_pd_tickets_asignado   ON pd_tickets(asignado_a);

-- =============================================
-- 5. Mensajes del ticket (timeline de conversación)
-- =============================================
CREATE TABLE pd_ticket_mensajes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id   UUID REFERENCES pd_tickets(id) ON DELETE CASCADE NOT NULL,
  autor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  origen      TEXT CHECK (origen IN ('interno', 'cliente', 'nota')) DEFAULT 'interno',
  mensaje     TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pd_ticket_mensajes_ticket ON pd_ticket_mensajes(ticket_id, created_at);

-- =============================================
-- 6. Junction ticket ↔ etiquetas
-- =============================================
CREATE TABLE pd_ticket_etiquetas (
  ticket_id   UUID REFERENCES pd_tickets(id) ON DELETE CASCADE,
  etiqueta_id UUID REFERENCES pd_etiquetas(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, etiqueta_id)
);

-- =============================================
-- RLS — Row Level Security
-- =============================================
-- Política: cualquier usuario autenticado con perfil activo puede leer todo.
-- Escritura: admin todo; soporte CRUD clientes/contactos/tickets; dev solo comenta tickets y lee.
-- (Fase 1 simple: si hay perfil activo, puede leer/escribir salvo restricciones específicas)

ALTER TABLE pd_usuarios_perfil   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_clientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_contactos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_etiquetas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_tickets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_ticket_mensajes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_ticket_etiquetas  ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada uno lee su propio perfil; admin lee y escribe todos
CREATE POLICY pd_perfil_self_read ON pd_usuarios_perfil FOR SELECT
  USING (auth.uid() = id OR pd_rol_actual() = 'admin');
CREATE POLICY pd_perfil_admin_all ON pd_usuarios_perfil FOR ALL
  USING (pd_rol_actual() = 'admin')
  WITH CHECK (pd_rol_actual() = 'admin');

-- Clientes: leen todos los roles; escriben admin y soporte
CREATE POLICY pd_clientes_read ON pd_clientes FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_clientes_write ON pd_clientes FOR ALL
  USING (pd_rol_actual() IN ('admin', 'soporte'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'soporte'));

-- Contactos: mismo criterio que clientes
CREATE POLICY pd_contactos_read ON pd_contactos FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_contactos_write ON pd_contactos FOR ALL
  USING (pd_rol_actual() IN ('admin', 'soporte'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'soporte'));

-- Etiquetas: leen todos, escriben admin y soporte
CREATE POLICY pd_etiquetas_read ON pd_etiquetas FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_etiquetas_write ON pd_etiquetas FOR ALL
  USING (pd_rol_actual() IN ('admin', 'soporte'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'soporte'));

-- Tickets: todos leen; admin/soporte CRUD; dev puede update (para cambiar estado al trabajar)
CREATE POLICY pd_tickets_read ON pd_tickets FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_tickets_insert ON pd_tickets FOR INSERT
  WITH CHECK (pd_rol_actual() IN ('admin', 'soporte'));
CREATE POLICY pd_tickets_update ON pd_tickets FOR UPDATE
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_tickets_delete ON pd_tickets FOR DELETE
  USING (pd_rol_actual() = 'admin');

-- Mensajes: todos leen y comentan
CREATE POLICY pd_ticket_mensajes_read ON pd_ticket_mensajes FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_ticket_mensajes_insert ON pd_ticket_mensajes FOR INSERT
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));

-- Etiquetas en tickets: admin/soporte asignan, todos leen
CREATE POLICY pd_ticket_etiquetas_read ON pd_ticket_etiquetas FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_ticket_etiquetas_write ON pd_ticket_etiquetas FOR ALL
  USING (pd_rol_actual() IN ('admin', 'soporte'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'soporte'));

-- =============================================
-- Semilla de etiquetas comunes
-- =============================================
INSERT INTO pd_etiquetas (nombre, color) VALUES
  ('impresora',    '#6366f1'),
  ('facturación',  '#059669'),
  ('error sistema','#dc2626'),
  ('consulta',     '#f59e0b'),
  ('capacitación', '#0891b2')
ON CONFLICT (nombre) DO NOTHING;

-- =============================================
-- IMPORTANTE — Post instalación
-- =============================================
-- 1. Crear usuarios desde Supabase > Authentication > Users.
-- 2. Para cada uno, insertar perfil:
--      INSERT INTO pd_usuarios_perfil (id, nombre, rol)
--      VALUES ('<uuid-del-auth-user>', 'Tu Nombre', 'admin');
-- 3. Sin perfil activo en pd_usuarios_perfil, RLS bloquea toda lectura/escritura.
