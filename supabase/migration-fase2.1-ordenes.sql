-- =============================================
-- Pulso Desk — Migration Fase 2.1: rediseño de órdenes
-- Ejecutar en: Supabase > SQL Editor (después de migration-fase2.sql)
-- =============================================

-- 1. Pasar datos existentes: 'backlog' → 'pendiente'
UPDATE pd_ordenes SET estado = 'pendiente' WHERE estado = 'backlog';

-- 2. Reemplazar el CHECK con los nuevos valores
ALTER TABLE pd_ordenes DROP CONSTRAINT IF EXISTS pd_ordenes_estado_check;
ALTER TABLE pd_ordenes ADD  CONSTRAINT pd_ordenes_estado_check
  CHECK (estado IN ('pendiente', 'en_progreso', 'terminado'));

-- Ajustar default
ALTER TABLE pd_ordenes ALTER COLUMN estado SET DEFAULT 'pendiente';

-- 3. Nuevas columnas
ALTER TABLE pd_ordenes ADD COLUMN IF NOT EXISTS funcionalidad   TEXT;
ALTER TABLE pd_ordenes ADD COLUMN IF NOT EXISTS sistema         TEXT;
ALTER TABLE pd_ordenes ADD COLUMN IF NOT EXISTS fecha_objetivo  DATE;

-- Índice para filtrar por sistema rápido
CREATE INDEX IF NOT EXISTS idx_pd_ordenes_sistema ON pd_ordenes(sistema);

-- 4. Bitácora de observaciones por orden
CREATE TABLE IF NOT EXISTS pd_orden_notas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id    UUID REFERENCES pd_ordenes(id) ON DELETE CASCADE NOT NULL,
  autor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nota        TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pd_orden_notas_orden ON pd_orden_notas(orden_id, created_at);

-- RLS bitácora: misma política que órdenes (admin/dev escriben, soporte lee)
ALTER TABLE pd_orden_notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY pd_orden_notas_read ON pd_orden_notas FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_orden_notas_insert ON pd_orden_notas FOR INSERT
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador'));
CREATE POLICY pd_orden_notas_delete ON pd_orden_notas FOR DELETE
  USING (pd_rol_actual() = 'admin');
