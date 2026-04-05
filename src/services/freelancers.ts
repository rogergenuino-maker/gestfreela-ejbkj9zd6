import { supabase } from '@/lib/supabase/client'
import { sendEmailNotification } from './email'

export const getFreelancerByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('freelancers')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const notifyFreelancerApproval = async (freelancerId: string) => {
  await sendEmailNotification('freelancer_aprovado', { freelancerId })
}
