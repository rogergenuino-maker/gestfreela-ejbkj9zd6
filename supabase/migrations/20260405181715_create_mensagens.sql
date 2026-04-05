CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destinatario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  lido BOOLEAN NOT NULL DEFAULT false,
  data_envio TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mensagens_select" ON public.mensagens;
CREATE POLICY "mensagens_select" ON public.mensagens
  FOR SELECT TO authenticated
  USING (auth.uid() = remetente_id OR auth.uid() = destinatario_id);

DROP POLICY IF EXISTS "mensagens_insert" ON public.mensagens;
CREATE POLICY "mensagens_insert" ON public.mensagens
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = remetente_id);

DROP POLICY IF EXISTS "mensagens_update" ON public.mensagens;
CREATE POLICY "mensagens_update" ON public.mensagens
  FOR UPDATE TO authenticated
  USING (auth.uid() = destinatario_id)
  WITH CHECK (auth.uid() = destinatario_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'mensagens'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens';
  END IF;
END $$;
