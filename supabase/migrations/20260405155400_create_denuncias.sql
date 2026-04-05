CREATE TABLE IF NOT EXISTS public.denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
  denunciante_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_denuncia TEXT NOT NULL,
  descricao TEXT NOT NULL,
  evidencias_url TEXT,
  data_denuncia TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "denuncias_insert" ON public.denuncias;
CREATE POLICY "denuncias_insert" ON public.denuncias
  FOR INSERT TO authenticated WITH CHECK (denunciante_id = auth.uid());

DROP POLICY IF EXISTS "denuncias_select" ON public.denuncias;
CREATE POLICY "denuncias_select" ON public.denuncias
  FOR SELECT TO authenticated USING (
    denunciante_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.user_type = 'admin')
  );

-- Create bucket for evidencias
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidencias', 'evidencias', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "evidencias_insert" ON storage.objects;
CREATE POLICY "evidencias_insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidencias');

DROP POLICY IF EXISTS "evidencias_select" ON storage.objects;
CREATE POLICY "evidencias_select" ON storage.objects 
  FOR SELECT TO authenticated USING (bucket_id = 'evidencias');
