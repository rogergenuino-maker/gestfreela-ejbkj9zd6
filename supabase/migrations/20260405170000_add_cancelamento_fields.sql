ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS url_termo_cancelamento TEXT;

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('documentos_contrato', 'documentos_contrato', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "documentos_contrato_select" ON storage.objects;
CREATE POLICY "documentos_contrato_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'documentos_contrato');

DROP POLICY IF EXISTS "documentos_contrato_insert" ON storage.objects;
CREATE POLICY "documentos_contrato_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos_contrato');

DROP POLICY IF EXISTS "documentos_contrato_update" ON storage.objects;
CREATE POLICY "documentos_contrato_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documentos_contrato');
