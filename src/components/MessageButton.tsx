'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MessageButton({ profileId }: { profileId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Look for an existing conversation between exactly these two people
    const { data: myConvos } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    let existingId: string | null = null
    if (myConvos && myConvos.length > 0) {
      const { data: theirConvos } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', profileId)
        .in('conversation_id', myConvos.map((c) => c.conversation_id))
      if (theirConvos && theirConvos.length > 0) {
        existingId = theirConvos[0].conversation_id
      }
    }

    if (existingId) {
      router.push(`/chat/${existingId}`)
      return
    }

    // No existing conversation — create one
    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single()

    if (error || !newConvo) {
      setLoading(false)
      return
    }

    await supabase.from('conversation_participants').insert([
      { conversation_id: newConvo.id, user_id: user.id },
      { conversation_id: newConvo.id, user_id: profileId },
    ])

    router.push(`/chat/${newConvo.id}`)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm px-3 py-1"
      style={{
        backgroundColor: 'transparent',
        color: 'var(--color-ink)',
        border: '1px solid var(--color-ink)',
      }}
    >
      {loading ? '...' : 'Message'}
    </button>
  )
}