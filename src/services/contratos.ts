import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type ContratoInsert = Database['public']['Tables']['contratos']['Insert']

export const createContrato = async (contrato: ContratoInsert) => {
  const { data, error } = await supabase.from('contratos').insert(contrato).select().single()
  return { data, error }
}

export const getContratoById = async (id: string) => {
  const { data, error } = await supabase
    .from('contratos')
    .select(`
      *,
      vaga:vagas(*),
      empresa:empresas(*),
      freelancer:freelancers(*)
    `)
    .eq('id', id)
    .single()
  return { data, error }
}

export const assinarContrato = async (id: string, logData: any) => {
  const { data: contrato, error: errorUpdate } = await supabase
    .from('contratos')
    .update({
      status: 'ativo',
      data_assinatura: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (errorUpdate) return { error: errorUpdate }

  if (logData) {
    const { error: errorLog } = await supabase.from('logs_aceite_digital').insert(logData)
    if (errorLog) console.error('Erro ao salvar log de aceite', errorLog)
  }

  return { data: contrato, error: null }
}
