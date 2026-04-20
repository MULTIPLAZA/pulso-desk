-- =============================================
-- Pulso Desk — Migration Fase 2.3: sistema en solicitudes
-- Ejecutar en: Supabase > SQL Editor
-- =============================================

-- Agregar FK al sistema para filtrar solicitudes por producto
ALTER TABLE pd_solicitudes
  ADD COLUMN IF NOT EXISTS sistema_id UUID REFERENCES pd_sistemas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pd_solicitudes_sistema_id ON pd_solicitudes(sistema_id);
