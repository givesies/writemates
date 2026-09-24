'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users } from 'lucide-react'

type ConversationRow = {
  conversation_id: string
}

type OtherPerson = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

type LastMessage = {
  content: string
  created_at: string
}

type ConversationSummary = {
  id: string
  other: OtherPerson | null
  last: LastMessage | null
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: myConvos } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)

      const convoIds = (myConvos || []).map((c: ConversationRow) => c.conversation_id)

      const results: ConversationSummary[] = []
      for (const convoId of convoIds) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('profiles(id, username, display_name, avatar_url)')
          .eq('conversation_id', convoId)
          .neq('user_id', user.id)
          .maybeSingle()

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', convoId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        results.push({
          id: convoId,
          other: (otherParticipant?.profiles as unknown as OtherPerson) || null,
          last: lastMsg || null,
        })
      }

      results.sort((a, b) => {
        if (!a.last) return 1
        if (!b.last) return -1
        return new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime()
      })

      setConversations(results)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
          Chat
        </h1>
        <Link
          href="/groups"
          className="flex items-center gap-1.5 text-sm rounded-full"
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-rule)',
            padding: '0.4rem 0.8rem',
          }}
        >
          <Users size={15} />
          Groups
        </Link>
      </div>

      {conversations.length === 0 && (
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          No conversations yet. Visit a writer&apos;s profile and tap Message to start one.
        </p>
      )}

      <div>
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className="flex items-center gap-3 mb-3 rounded-lg"
            style={{
              border: '1px solid var(--color-rule)',
              backgroundColor: 'var(--color-paper)',
              padding: '0.85rem 1rem',
            }}
          >
            {c.other?.avatar_url ? (
              <img src={c.other.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-ink-muted)' }}
              >
                {c.other?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink)' }}>
                {c.other?.display_name || c.other?.username || 'Unknown'}
              </div>
              {c.last && (
                <div
                  className="text-sm truncate"
                  style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
                >
                  {c.last.content}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
