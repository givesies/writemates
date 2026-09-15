'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UnreadChatDot() {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let interval: ReturnType<typeof setInterval>

    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id)

      if (!participations || participations.length === 0) return

      let unread = false
      for (const p of participations) {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('created_at, sender_id')
          .eq('conversation_id', p.conversation_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (
          lastMsg &&
          lastMsg.sender_id !== user.id &&
          new Date(lastMsg.created_at) > new Date(p.last_read_at)
        ) {
          unread = true
          break
        }
      }
      setHasUnread(unread)
    }

    check()
    interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [])

  if (!hasUnread) return null

  return (
    <span
      style={{
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'var(--color-accent)',
      }}
    />
  )
}