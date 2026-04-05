import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type VagaInsert = Database['public']['Tables']['vagas']['Insert']

export const createVaga = async (vaga: VagaInsert) => {
  const { data, error } = await supabase.from('vagas').insert(vaga).select().single()
  return { data, error }
}
