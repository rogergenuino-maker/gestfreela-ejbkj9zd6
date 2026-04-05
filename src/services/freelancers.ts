import { supabase } from '@/lib/supabase/client'

export const getFreelancerByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('freelancers')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}
