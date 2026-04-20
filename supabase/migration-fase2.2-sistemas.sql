-- =============================================
-- Pulso Desk — Migration Fase 2.2: sistemas como tabla gestionable
-- Ejecutar en: Supabase > SQL Editor
-- Idempotente: se puede correr aunque ya se haya corrido parcialmente.
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

DROP POLICY IF EXISTS pd_sistemas_read  ON pd_sistemas;
DROP POLICY IF EXISTS pd_sistemas_write ON pd_sistemas;

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

-- 4. Agregar columna FK en pd_ordenes (si no existe)
ALTER TABLE pd_ordenes ADD COLUMN IF NOT EXISTS sistema_id UUID REFERENCES pd_sistemas(id) ON DELETE SET NULL;

-- 5. Si existe la columna legacy 'sistema', migrar datos y luego eliminarla
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pd_ordenes' AND column_name = 'sistema'
  ) THEN
    UPDATE pd_ordenes o
    SET sistema_id = s.id
    FROM pd_sistemas s
    WHERE o.sistema = s.nombre AND o.sistema_id IS NULL;

    ALTER TABLE pd_ordenes DROP COLUMN sistema;
  END IF;
END $$;

-- 6. Índice para filtrar rápido por sistema
CREATE INDEX IF NOT EXISTS idx_pd_ordenes_sistema_id ON pd_ordenes(sistema_id);
