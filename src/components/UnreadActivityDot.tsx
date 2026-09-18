'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UnreadActivityDot() {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let interval: ReturnType<typeof setInterval>

    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('activity_last_read_at')
        .eq('id', user.id)
        .single()

      if (!profile) return
      const lastRead = new Date(profile.activity_last_read_at)

      const { data: myPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id)

      const myPostIds = (myPosts || []).map((p) => p.id)

      let unread = false

      if (myPostIds.length > 0) {
        const { data: recentLike } = await supabase
          .from('likes')
          .select('created_at')
          .in('post_id', myPostIds)
          .neq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (recentLike && new Date(recentLike.created_at) > lastRead) {
          unread = true
        }
      }

      if (!unread) {
        const { data: recentFollow } = await supabase
          .from('follows')
          .select('created_at')
          .eq('following_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (recentFollow && new Date(recentFollow.created_at) > lastRead) {
          unread = true
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