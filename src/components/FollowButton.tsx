'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FollowButton({
  profileId,
  initialFollowing,
}: {
  profileId: string
  initialFollowing: boolean
}) {
  const [following, setFollowing] = useState(initialFollowing)

  async function toggleFollow() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (following) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profileId)
      setFollowing(false)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profileId })
      setFollowing(true)
    }
  }

  return (
    <button
      onClick={toggleFollow}
      className="text-sm px-3 py-1"
      style={{
        backgroundColor: following ? 'transparent' : 'var(--color-ink)',
        color: following ? 'var(--color-ink)' : 'var(--color-paper)',
        border: following ? '1px solid var(--color-ink)' : 'none',
      }}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}