CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  total_horas NUMERIC DEFAULT 0,
  valor_hora NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  descontos NUMERIC DEFAULT 0,
  valor_final NUMERIC DEFAULT 0,
  data_calculo TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT pagamentos_contrato_id_key UNIQUE (contrato_id)
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pagamentos_select" ON public.pagamentos;
CREATE POLICY "pagamentos_select" ON public.pagamentos
  FOR SELECT TO authenticated 
  USING (
    contrato_id IN (
      SELECT id FROM public.contratos WHERE 
      empresa_id IN (SELECT id FROM public.empresas WHERE user_id = auth.uid()) OR 
      freelancer_id IN (SELECT id FROM public.freelancers WHERE user_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.user_type = 'admin')
  );

DROP POLICY IF EXISTS "pagamentos_insert" ON public.pagamentos;
CREATE POLICY "pagamentos_insert" ON public.pagamentos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "pagamentos_update" ON public.pagamentos;
CREATE POLICY "pagamentos_update" ON public.pagamentos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
