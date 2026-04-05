DO $$
BEGIN
  -- Permite que freelancers possam inserir contratos (aceitar vagas) onde eles são os contratados
  DROP POLICY IF EXISTS "contratos_insert" ON public.contratos;
  CREATE POLICY "contratos_insert" ON public.contratos
    FOR INSERT TO authenticated
    WITH CHECK (
      (empresa_id IN ( SELECT empresas.id FROM empresas WHERE empresas.user_id = auth.uid())) OR
      (freelancer_id IN ( SELECT freelancers.id FROM freelancers WHERE freelancers.user_id = auth.uid())) OR
      (EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.user_type = 'admin'))
    );
END $$;
