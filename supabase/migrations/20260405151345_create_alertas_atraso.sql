CREATE TABLE IF NOT EXISTS public.alertas_atraso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid REFERENCES public.freelancers(id) ON DELETE CASCADE,
  contrato_id uuid REFERENCES public.contratos(id) ON DELETE CASCADE,
  tipo_alerta text NOT NULL,
  mensagem text NOT NULL,
  data_hora_alerta timestamptz DEFAULT now(),
  status text DEFAULT 'Pendente'
);

ALTER TABLE public.alertas_atraso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "empresas_podem_ver_seus_alertas" ON public.alertas_atraso;
CREATE POLICY "empresas_podem_ver_seus_alertas" ON public.alertas_atraso
  FOR SELECT TO authenticated
  USING (
    contrato_id IN (
      SELECT id FROM public.contratos WHERE empresa_id IN (
        SELECT id FROM public.empresas WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "freelancers_podem_ver_seus_alertas" ON public.alertas_atraso;
CREATE POLICY "freelancers_podem_ver_seus_alertas" ON public.alertas_atraso
  FOR SELECT TO authenticated
  USING (
    freelancer_id IN (
      SELECT id FROM public.freelancers WHERE user_id = auth.uid()
    )
  );
  
DROP POLICY IF EXISTS "admin_all_alertas" ON public.alertas_atraso;
CREATE POLICY "admin_all_alertas" ON public.alertas_atraso
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.user_type = 'admin')
  );
