DO $DO$
BEGIN
  -- Cria a função para atualizar o status da vaga para 'preenchida' quando o contrato ficar 'ativo'
  CREATE OR REPLACE FUNCTION public.update_vaga_on_contrato_signed()
  RETURNS TRIGGER AS $FUNC$
  BEGIN
    IF NEW.status = 'ativo' AND OLD.status != 'ativo' THEN
      UPDATE public.vagas SET status = 'preenchida' WHERE id = NEW.vaga_id;
    END IF;
    RETURN NEW;
  END;
  $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Recria a trigger atrelada a tabela de contratos
  DROP TRIGGER IF EXISTS on_contrato_signed ON public.contratos;
  CREATE TRIGGER on_contrato_signed
    AFTER UPDATE ON public.contratos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vaga_on_contrato_signed();
END $DO$;
