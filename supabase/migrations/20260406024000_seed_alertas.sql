DO $$
DECLARE
  v_contrato_id uuid;
  v_freelancer_id uuid;
BEGIN
  -- Obtem um contrato aleatório que já exista para inserir os dados de exemplo
  SELECT id, freelancer_id INTO v_contrato_id, v_freelancer_id
  FROM public.contratos
  LIMIT 1;

  IF v_contrato_id IS NOT NULL AND v_freelancer_id IS NOT NULL THEN
    INSERT INTO public.alertas_atraso (id, freelancer_id, contrato_id, tipo_alerta, mensagem, status, data_hora_alerta)
    VALUES 
      (gen_random_uuid(), v_freelancer_id, v_contrato_id, 'Atraso Check-in', 'Freelancer atrasou mais de 15 minutos.', 'Pendente', NOW() - INTERVAL '1 day'),
      (gen_random_uuid(), v_freelancer_id, v_contrato_id, 'Inconsistência', 'Divergência no local do check-in.', 'Resolvido', NOW() - INTERVAL '3 days'),
      (gen_random_uuid(), v_freelancer_id, v_contrato_id, 'Denúncia', 'Comportamento inadequado reportado pela empresa.', 'Pendente', NOW() - INTERVAL '5 days')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
