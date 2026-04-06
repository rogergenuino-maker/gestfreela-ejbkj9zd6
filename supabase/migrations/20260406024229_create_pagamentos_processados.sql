CREATE TABLE IF NOT EXISTS public.pagamentos_processados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.freelancers(id) ON DELETE CASCADE,
  valor_pago NUMERIC NOT NULL,
  data_pagamento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status_stripe TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pagamentos_processados ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to make it idempotent
DROP POLICY IF EXISTS "pagamentos_processados_select" ON public.pagamentos_processados;
DROP POLICY IF EXISTS "pagamentos_processados_insert" ON public.pagamentos_processados;
DROP POLICY IF EXISTS "pagamentos_processados_update" ON public.pagamentos_processados;
DROP POLICY IF EXISTS "pagamentos_processados_delete" ON public.pagamentos_processados;

-- Policies
CREATE POLICY "pagamentos_processados_select" ON public.pagamentos_processados
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "pagamentos_processados_insert" ON public.pagamentos_processados
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "pagamentos_processados_update" ON public.pagamentos_processados
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "pagamentos_processados_delete" ON public.pagamentos_processados
  FOR DELETE TO authenticated
  USING (true);
