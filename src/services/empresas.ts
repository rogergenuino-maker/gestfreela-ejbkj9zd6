import { supabase } from '@/lib/supabase/client'

export const getCurrentEmpresa = async (userId: string) => {
  const { data, error } = await supabase.from('empresas').select('*').eq('user_id', userId).single()
  return { data, error }
}
