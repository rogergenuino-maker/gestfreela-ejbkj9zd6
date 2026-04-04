ALTER TABLE public.documentos_validacao ADD COLUMN IF NOT EXISTS comentario text;

DO $$
BEGIN
  -- Enable select policy for empresas/admins
  DROP POLICY IF EXISTS "docs_select_empresa" ON public.documentos_validacao;
  CREATE POLICY "docs_select_empresa" ON public.documentos_validacao
    FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.empresas WHERE empresas.user_id = auth.uid()) OR 
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.user_type = 'admin')
    );

  -- Enable update policy for empresas/admins
  DROP POLICY IF EXISTS "docs_update_empresa" ON public.documentos_validacao;
  CREATE POLICY "docs_update_empresa" ON public.documentos_validacao
    FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.empresas WHERE empresas.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.user_type = 'admin')
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.empresas WHERE empresas.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.user_type = 'admin')
    );
END $$;
