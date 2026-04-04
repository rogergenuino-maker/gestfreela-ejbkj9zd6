CREATE TABLE IF NOT EXISTS public.freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  formacao TEXT,
  experiencia_anos INTEGER,
  descricao TEXT,
  telefone TEXT,
  email TEXT,
  foto_perfil TEXT,
  taxa_hora NUMERIC,
  taxa_diaria NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_freelancers" ON public.freelancers;
CREATE POLICY "auth_all_freelancers" ON public.freelancers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
