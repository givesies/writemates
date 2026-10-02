'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Block or unblock another user. Blocking hides their posts and chats from you
// and stops them from messaging you.
export default function BlockButton({
  profileId,
  initialBlocked,
}: {
  profileId: string
  initialBlocked: boolean
}) {
  const [blocked, setBlocked] = useState(initialBlocked)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function toggle() {
    if (!blocked) {
      const ok = window.confirm(
        'Block this person? You won’t see their posts or chats, and they won’t be able to message you.'
      )
      if (!ok) return
    }

    setWorking(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setWorking(false)
      return
    }

    const { error: dbError } = blocked
      ? await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', profileId)
      : await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: profileId })

    setWorking(false)
    if (dbError) {
      setError(dbError.message)
      return
    }
    setBlocked(!blocked)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={working}
        className="flex items-center gap-1 text-sm"
        style={{ fontFamily: 'var(--font-sans)', color: blocked ? '#a33' : 'var(--color-ink-muted)' }}
      >
        <Ban size={16} />
        {blocked ? 'Unblock' : 'Block'}
      </button>
      {error && <span className="text-sm" style={{ color: '#a33' }}>{error}</span>}
    </>
  )
}
