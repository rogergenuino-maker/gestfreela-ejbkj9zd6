import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export function useUnreadMessages() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('mensagens' as any)
        .select('id', { count: 'exact', head: true })
        .eq('destinatario_id', user.id)
        .eq('lido', false)

      setUnreadCount(count || 0)
    }

    fetchUnread()

    const channel = supabase
      .channel('public:mensagens')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensagens',
          filter: `destinatario_id=eq.${user.id}`,
        },
        () => {
          fetchUnread()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return unreadCount
}
