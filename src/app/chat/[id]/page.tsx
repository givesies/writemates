'use client'

import { useEffect, useState, useRef, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState('Conversation')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      if (!active) return
      setUserId(user.id)

      const { data: otherParticipant } = await supabase
        .from('conversation_participants')
        .select('profiles(display_name, username)')
        .eq('conversation_id', id)
        .neq('user_id', user.id)
        .maybeSingle()

      const other = otherParticipant?.profiles as unknown as { display_name: string | null; username: string } | null
      if (other && active) setOtherName(other.display_name || other.username)

      const { data: existingMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      if (!active) return
      setMessages(existingMessages || [])
      setLoading(false)

      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', id)
        .eq('user_id', user.id)
    }

    load()

    // Set up the live-update connection synchronously, so it's only ever created once per mount
    const channel = supabase
      .channel(`messages-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [id, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !userId) return

    const supabase = createClient()
    const text = content
    setContent('')

    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: userId,
      content: text,
    })
  }

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  return (
    <main className="max-w-md mx-auto px-6 py-8 flex flex-col" style={{ minHeight: '70vh' }}>
      <h1 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        {otherName}
      </h1>

      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((m) => {
          const mine = m.sender_id === userId
          return (
            <div key={m.id} className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className="px-4 py-2 rounded-2xl max-w-[75%]"
                style={{
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: mine ? 'var(--color-accent)' : 'var(--color-paper-raised)',
                  color: mine ? 'var(--color-paper)' : 'var(--color-ink)',
                }}
              >
                {m.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2" style={{ fontFamily: 'var(--font-sans)' }}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 py-2 px-3 border-b bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--color-rule)' }}
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Send
        </button>
      </form>
    </main>
  )
}