-- =============================================
-- Pulso Desk — Migration Fase 2.4: adjuntos por link
-- Ejecutar en: Supabase > SQL Editor
-- =============================================

-- Tabla para almacenar links de adjuntos (Drive, YouTube, Loom, etc.)
-- Un adjunto pertenece a un ticket O a una orden (nunca los dos).
CREATE TABLE IF NOT EXISTS pd_adjuntos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id    UUID REFERENCES pd_tickets(id) ON DELETE CASCADE,
  orden_id     UUID REFERENCES pd_ordenes(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  descripcion  TEXT,
  creado_por   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Exactamente uno de ticket_id u orden_id debe estar seteado
  CONSTRAINT adjunto_pertenece_a_uno CHECK (
    (ticket_id IS NOT NULL AND orden_id IS NULL) OR
    (ticket_id IS NULL     AND orden_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_pd_adjuntos_ticket ON pd_adjuntos(ticket_id);
CREATE INDEX IF NOT EXISTS idx_pd_adjuntos_orden  ON pd_adjuntos(orden_id);

ALTER TABLE pd_adjuntos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pd_adjuntos_read   ON pd_adjuntos;
DROP POLICY IF EXISTS pd_adjuntos_insert ON pd_adjuntos;
DROP POLICY IF EXISTS pd_adjuntos_delete ON pd_adjuntos;

-- Todos los roles pueden ver los adjuntos
CREATE POLICY pd_adjuntos_read ON pd_adjuntos FOR SELECT
  USING (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));

-- Todos los roles pueden agregar
CREATE POLICY pd_adjuntos_insert ON pd_adjuntos FOR INSERT
  WITH CHECK (pd_rol_actual() IN ('admin', 'desarrollador', 'soporte'));

-- Uno puede borrar los propios; admin puede borrar cualquiera
CREATE POLICY pd_adjuntos_delete ON pd_adjuntos FOR DELETE
  USING (creado_por = auth.uid() OR pd_rol_actual() = 'admin');
