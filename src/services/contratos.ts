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

export const cancelarContrato = async (
  id: string,
  penalidadeAplicada: boolean,
  valorEstornado: number,
  motivoCancelamento: string,
  urlTermoCancelamento: string,
) => {
  const { data, error } = await supabase
    .from('contratos')
    .update({
      status: 'cancelado',
      penalidade_aplicada: penalidadeAplicada,
      valor_estornado: valorEstornado,
      motivo_cancelamento: motivoCancelamento,
      url_termo_cancelamento: urlTermoCancelamento,
    } as any)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const uploadTermoCancelamento = async (contratoId: string, htmlContent: string) => {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  const fileName = `cancelamento_${contratoId}_${Date.now()}.html`

  const { data, error } = await supabase.storage
    .from('documentos_contrato')
    .upload(fileName, blob, {
      contentType: 'text/html',
      upsert: true,
    })

  if (error) return { error }

  const { data: publicData } = supabase.storage.from('documentos_contrato').getPublicUrl(fileName)

  return { url: publicData.publicUrl, error: null }
}
