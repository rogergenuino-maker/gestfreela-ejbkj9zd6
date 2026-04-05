import { supabase } from '@/lib/supabase/client'

export const sendEmailNotification = async (type: string, data: any) => {
  try {
    await supabase.functions.invoke('send-email', {
      body: { type, data },
    })
  } catch (error) {
    console.error('Failed to trigger email notification:', error)
  }
}
