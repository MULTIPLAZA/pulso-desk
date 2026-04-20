-- =============================================
-- Pulso Desk — Migration Fase 2
-- Ejecutar en: Supabase > SQL Editor (después de schema.sql)
-- =============================================

-- =============================================
-- 7. Solicitudes de cambio / mejora
-- =============================================
CREATE TABLE pd_solicitudes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero        SERIAL UNIQUE,
  titulo        TEXT NOT NULL,
  descripcion   TEXT,
  cliente_id    UUID REFERENCES pd_clientes(id) ON DELETE SET NULL,
  impacto       TEXT CHECK (impacto IN ('bajo', 'medio', 'alto')) DEFAULT 'medio',
  frecuencia    INTEGER DEFAULT 1,  -- cuántos clientes lo pidieron
  estado        TEXT CHECK (estado IN ('pendiente', 'en_analisis', 'aprobado', 'rechazado')) DEFAULT 'pendiente',
  creado_por    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER pd_solicitudes_updated_at
  BEFORE UPDATE ON pd_solicitudes
  FOR EACH ROW EXECUTE FUNCTION pd_tg_updated_at();

CREATE INDEX idx_pd_solicitudes_estado  ON pd_solicitudes(estado);
CREATE INDEX idx_pd_solicitudes_cliente ON pd_solicitudes(cliente_id);

-- =============================================
-- 8. Órdenes de trabajo (desarrollo)
-- =============================================
CREATE TABLE pd_ordenes (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero                SERIAL UNIQUE,
  titulo                TEXT NOT NULL,
  descripcion_tecnica   TEXT,
  complejidad           TEXT CHECK (complejidad IN ('baja', 'media', 'alta')) DEFAULT 'media',
  prioridad             TEXT CHECK (prioridad IN ('baja', 'media', 'alta')) DEFAULT 'media',
  estado                TEXT CHECK (estado IN ('backlog', 'en_progreso', 'terminado')) DEFAULT 'backlog',
  asignado_a            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creado_por            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  terminado_at          TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER pd_ordenes_updated_at
  BEFORE UPDATE ON pd_ordenes
  FOR EACH ROW EXECUTE FUNCTION pd_tg_updated_at();

CREATE INDEX idx_pd_ordenes_estado   ON pd_ordenes(estado);
CREATE INDEX idx_pd_ordenes_asignado ON pd_ordenes(asignado_a);

-- =============================================
-- 9. Junctions N:N
-- =============================================
CREATE TABLE pd_orden_ticket (
  orden_id    UUID REFERENCES pd_ordenes(id) ON DELETE CASCADE,
  ticket_id   UUID REFERENCES pd_tickets(id) ON DELETE CASCADE,
  PRIMARY KEY (orden_id, ticket_id)
);

CREATE TABLE pd_orden_solicitud (
  orden_id       UUID REFERENCES pd_ordenes(id) ON DELETE CASCADE,
  solicitud_id   UUID REFERENCES pd_solicitudes(id) ON DELETE CASCADE,
  PRIMARY KEY (orden_id, solicitud_id)
);

-- =============================================
-- RLS — Fase 2
-- =============================================
ALTER TABLE pd_solicitudes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_ordenes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_orden_ticket      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_orden_solicitud   ENABLE ROW LEVEL SECURITY;

-- Solicitudes: todos leen; admin/soporte/dev crean; admin aprueba; admin borra
CREATE POLICY pd_solicitudes_read ON pd_solicitudes FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_solicitudes_insert ON pd_solicitudes FOR INSERT
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_solicitudes_update ON pd_solicitudes FOR UPDATE
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_solicitudes_delete ON pd_solicitudes FOR DELETE
  USING (pd_rol_actual() = 'admin');

-- Órdenes: todos leen; admin/dev crean y mueven estado; admin borra
CREATE POLICY pd_ordenes_read ON pd_ordenes FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_ordenes_insert ON pd_ordenes FOR INSERT
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador'));
CREATE POLICY pd_ordenes_update ON pd_ordenes FOR UPDATE
  USING (pd_rol_actual() IN ('admin', 'desarrollador'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador'));
CREATE POLICY pd_ordenes_delete ON pd_ordenes FOR DELETE
  USING (pd_rol_actual() = 'admin');

-- Junctions: mismas reglas que ordenes
CREATE POLICY pd_orden_ticket_read ON pd_orden_ticket FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_orden_ticket_write ON pd_orden_ticket FOR ALL
  USING (pd_rol_actual() IN ('admin', 'desarrollador'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador'));

CREATE POLICY pd_orden_solicitud_read ON pd_orden_solicitud FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_orden_solicitud_write ON pd_orden_solicitud FOR ALL
  USING (pd_rol_actual() IN ('admin', 'desarrollador'))
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador'));
