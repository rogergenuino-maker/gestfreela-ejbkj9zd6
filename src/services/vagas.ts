import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type VagaInsert = Database['public']['Tables']['vagas']['Insert']

export const createVaga = async (vaga: VagaInsert) => {
  const { data, error } = await supabase.from('vagas').insert(vaga).select().single()
  return { data, error }
}

export const getVagas = async () => {
  const { data, error } = await supabase
    .from('vagas')
    .select(`
      *,
      empresa:empresas(nome_empresa, logo)
    `)
    .eq('status', 'aberta')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getVagaById = async (id: string) => {
  const { data, error } = await supabase
    .from('vagas')
    .select(`
      *,
      empresa:empresas(id, nome_empresa, logo, descricao)
    `)
    .eq('id', id)
    .single()
  return { data, error }
}
