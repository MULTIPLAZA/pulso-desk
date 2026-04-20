-- =============================================
-- Pulso Desk — Migration Fase 2.2: sistemas como tabla gestionable
-- Ejecutar en: Supabase > SQL Editor (después de migration-fase2.1-ordenes.sql)
-- =============================================

-- 1. Tabla de sistemas
CREATE TABLE IF NOT EXISTS pd_sistemas (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre       TEXT UNIQUE NOT NULL,
  descripcion  TEXT,
  color        TEXT DEFAULT '#059669',
  activo       BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS: todos leen, solo admin escribe
ALTER TABLE pd_sistemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY pd_sistemas_read ON pd_sistemas FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));
CREATE POLICY pd_sistemas_write ON pd_sistemas FOR ALL
  USING (pd_rol_actual() = 'admin')
  WITH CHECK (pd_rol_actual() = 'admin');

-- 3. Sembrar defaults
INSERT INTO pd_sistemas (nombre, color) VALUES
  ('POS',           '#059669'),
  ('SIFEN Engine',  '#6366f1'),
  ('Panel Web',     '#0891b2'),
  ('XMLBox',        '#7c3aed'),
  ('CRM-Contactos', '#f59e0b'),
  ('Pulso Desk',    '#ec4899'),
  ('Otro',          '#64748b')
ON CONFLICT (nombre) DO NOTHING;

-- 4. Agregar columna FK en pd_ordenes
ALTER TABLE pd_ordenes ADD COLUMN IF NOT EXISTS sistema_id UUID REFERENCES pd_sistemas(id) ON DELETE SET NULL;

-- 5. Migrar datos existentes: match por nombre
UPDATE pd_ordenes o
SET sistema_id = s.id
FROM pd_sistemas s
WHERE o.sistema = s.nombre AND o.sistema_id IS NULL;

-- 6. Eliminar la columna de texto legacy
ALTER TABLE pd_ordenes DROP COLUMN IF EXISTS sistema;

-- Índice para filtrar rápido
CREATE INDEX IF NOT EXISTS idx_pd_ordenes_sistema_id ON pd_ordenes(sistema_id);
