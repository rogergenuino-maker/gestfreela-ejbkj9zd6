import { supabase } from '@/lib/supabase/client'

export interface DocumentInfo {
  id: string
  freelancer_id: string
  tipo_documento: string
  arquivo_url: string
  data_validade: string
  status_verificacao: string
  created_at: string
  comentario: string | null
  freelancers: {
    nome_completo: string
  } | null
}

export const fetchAllDocuments = async (): Promise<DocumentInfo[]> => {
  // Using 'as any' since Typescript definitions are not updated yet with the new 'comentario' column
  const client = supabase as any
  const { data, error } = await client
    .from('documentos_validacao')
    .select(`
      *,
      freelancers (
        nome_completo
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DocumentInfo[]
}

export const updateDocumentStatus = async (
  id: string,
  status: string,
  comentario: string | null = null,
) => {
  const client = supabase as any
  const { error } = await client
    .from('documentos_validacao')
    .update({
      status_verificacao: status,
      ...(comentario !== null ? { comentario } : {}),
    })
    .eq('id', id)

  if (error) throw error
}
