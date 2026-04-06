import { supabase } from '@/lib/supabase/client'

export interface Alerta {
  id: string
  freelancer_id: string | null
  contrato_id: string | null
  tipo_alerta: string
  mensagem: string
  data_hora_alerta: string | null
  status: string | null
  freelancers?: { nome_completo: string } | null
  contratos?: {
    id: string
    empresas?: { nome_empresa: string } | null
  } | null
}

export const fetchAlertas = async (): Promise<Alerta[]> => {
  const { data, error } = await supabase
    .from('alertas_atraso')
    .select(`
      *,
      freelancers (nome_completo),
      contratos (
        id,
        empresas (nome_empresa)
      )
    `)
    .order('data_hora_alerta', { ascending: false })

  if (error) {
    console.error('Error fetching alertas:', error)
    return []
  }

  return data as any as Alerta[]
}

export const updateAlertaStatus = async (id: string, status: string) => {
  const { error } = await supabase.from('alertas_atraso').update({ status }).eq('id', id)

  if (error) {
    console.error('Error updating alerta status:', error)
    throw error
  }
}
