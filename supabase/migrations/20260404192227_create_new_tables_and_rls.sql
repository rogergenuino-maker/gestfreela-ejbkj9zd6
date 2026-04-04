-- Create perfis
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    lgpd_aceito BOOLEAN DEFAULT false,
    data_aceite_lgpd TIMESTAMPTZ,
    status_conta TEXT DEFAULT 'ativo',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create documentos_validacao
CREATE TABLE IF NOT EXISTS public.documentos_validacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL,
    arquivo_url TEXT,
    data_validade DATE,
    status_verificacao TEXT DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create vagas
CREATE TABLE IF NOT EXISTS public.vagas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    natureza TEXT,
    escopo_trabalho TEXT,
    endereco_vaga TEXT,
    data_inicio TIMESTAMPTZ,
    data_fim TIMESTAMPTZ,
    valor_remuneracao NUMERIC,
    status TEXT DEFAULT 'aberta',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Alter contratos
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS vaga_id UUID REFERENCES public.vagas(id) ON DELETE SET NULL;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS data_assinatura TIMESTAMPTZ;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS penalidade_aplicada BOOLEAN DEFAULT false;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS valor_estornado NUMERIC DEFAULT 0;

-- Create logs_aceite_digital
CREATE TABLE IF NOT EXISTS public.logs_aceite_digital (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
    contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
    ip_dispositivo TEXT,
    data_hora_aceite TIMESTAMPTZ DEFAULT now()
);

-- Create checkins_operacionais
CREATE TABLE IF NOT EXISTS public.checkins_operacionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
    tipo TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    data_hora TIMESTAMPTZ DEFAULT now()
);

-- Create avaliacoes_rating
CREATE TABLE IF NOT EXISTS public.avaliacoes_rating (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
    nota_estrelas INTEGER,
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_validacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_aceite_digital ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins_operacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;

-- RLS for perfis
DROP POLICY IF EXISTS "perfis_select" ON public.perfis;
CREATE POLICY "perfis_select" ON public.perfis FOR SELECT TO authenticated USING (
    id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "perfis_update" ON public.perfis;
CREATE POLICY "perfis_update" ON public.perfis FOR UPDATE TO authenticated USING (
    id = auth.uid()
);

DROP POLICY IF EXISTS "perfis_insert" ON public.perfis;
CREATE POLICY "perfis_insert" ON public.perfis FOR INSERT TO authenticated WITH CHECK (
    id = auth.uid()
);

-- RLS for vagas
DROP POLICY IF EXISTS "vagas_select" ON public.vagas;
CREATE POLICY "vagas_select" ON public.vagas FOR SELECT TO authenticated USING (
    status = 'aberta' OR 
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "vagas_insert" ON public.vagas;
CREATE POLICY "vagas_insert" ON public.vagas FOR INSERT TO authenticated WITH CHECK (
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "vagas_update" ON public.vagas;
CREATE POLICY "vagas_update" ON public.vagas FOR UPDATE TO authenticated USING (
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "vagas_delete" ON public.vagas;
CREATE POLICY "vagas_delete" ON public.vagas FOR DELETE TO authenticated USING (
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS for documentos_validacao
DROP POLICY IF EXISTS "docs_select" ON public.documentos_validacao;
CREATE POLICY "docs_select" ON public.documentos_validacao FOR SELECT TO authenticated USING (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "docs_insert" ON public.documentos_validacao;
CREATE POLICY "docs_insert" ON public.documentos_validacao FOR INSERT TO authenticated WITH CHECK (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "docs_update" ON public.documentos_validacao;
CREATE POLICY "docs_update" ON public.documentos_validacao FOR UPDATE TO authenticated USING (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "docs_delete" ON public.documentos_validacao;
CREATE POLICY "docs_delete" ON public.documentos_validacao FOR DELETE TO authenticated USING (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS for logs_aceite_digital
DROP POLICY IF EXISTS "logs_select" ON public.logs_aceite_digital;
CREATE POLICY "logs_select" ON public.logs_aceite_digital FOR SELECT TO authenticated USING (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    contrato_id IN (SELECT id FROM public.contratos WHERE empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "logs_insert" ON public.logs_aceite_digital;
CREATE POLICY "logs_insert" ON public.logs_aceite_digital FOR INSERT TO authenticated WITH CHECK (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS for checkins_operacionais
DROP POLICY IF EXISTS "checkins_select" ON public.checkins_operacionais;
CREATE POLICY "checkins_select" ON public.checkins_operacionais FOR SELECT TO authenticated USING (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    contrato_id IN (SELECT id FROM public.contratos WHERE empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "checkins_insert" ON public.checkins_operacionais;
CREATE POLICY "checkins_insert" ON public.checkins_operacionais FOR INSERT TO authenticated WITH CHECK (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS for avaliacoes_rating
DROP POLICY IF EXISTS "avaliacoes_select" ON public.avaliacoes_rating;
CREATE POLICY "avaliacoes_select" ON public.avaliacoes_rating FOR SELECT TO authenticated USING (
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "avaliacoes_insert" ON public.avaliacoes_rating;
CREATE POLICY "avaliacoes_insert" ON public.avaliacoes_rating FOR INSERT TO authenticated WITH CHECK (
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

-- Update RLS for contratos
DROP POLICY IF EXISTS "auth_all_contratos" ON public.contratos;
DROP POLICY IF EXISTS "contratos_select" ON public.contratos;
CREATE POLICY "contratos_select" ON public.contratos FOR SELECT TO authenticated USING (
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "contratos_insert" ON public.contratos;
CREATE POLICY "contratos_insert" ON public.contratos FOR INSERT TO authenticated WITH CHECK (
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "contratos_update" ON public.contratos;
CREATE POLICY "contratos_update" ON public.contratos FOR UPDATE TO authenticated USING (
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "contratos_delete" ON public.contratos;
CREATE POLICY "contratos_delete" ON public.contratos FOR DELETE TO authenticated USING (
    empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

-- Update RLS for empresas
DROP POLICY IF EXISTS "auth_all_empresas" ON public.empresas;
DROP POLICY IF EXISTS "empresas_select" ON public.empresas;
CREATE POLICY "empresas_select" ON public.empresas FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "empresas_insert" ON public.empresas;
CREATE POLICY "empresas_insert" ON public.empresas FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "empresas_update" ON public.empresas;
CREATE POLICY "empresas_update" ON public.empresas FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "empresas_delete" ON public.empresas;
CREATE POLICY "empresas_delete" ON public.empresas FOR DELETE TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

-- Update RLS for freelancers
DROP POLICY IF EXISTS "auth_all_freelancers" ON public.freelancers;
DROP POLICY IF EXISTS "freelancers_select" ON public.freelancers;
CREATE POLICY "freelancers_select" ON public.freelancers FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin') OR
    EXISTS (SELECT 1 FROM public.empresas WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "freelancers_insert" ON public.freelancers;
CREATE POLICY "freelancers_insert" ON public.freelancers FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "freelancers_update" ON public.freelancers;
CREATE POLICY "freelancers_update" ON public.freelancers FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);

DROP POLICY IF EXISTS "freelancers_delete" ON public.freelancers;
CREATE POLICY "freelancers_delete" ON public.freelancers FOR DELETE TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')
);
