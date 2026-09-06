'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Member = {
  user_id: string
  profiles: { username: string; display_name: string | null }
}

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [groupName, setGroupName] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [usernameToAdd, setUsernameToAdd] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function loadGroup() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: group } = await supabase.from('groups').select('*').eq('id', id).single()
    if (group) {
      setGroupName(group.name)
      setIsOwner(group.owner_id === user.id)
    }

    const { data: memberData } = await supabase
      .from('group_members')
      .select('user_id, profiles(username, display_name)')
      .eq('group_id', id)

    setMembers((memberData as unknown as Member[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadGroup()
  }, [id])

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()

    const { data: targetProfile, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', usernameToAdd.trim())
      .single()

    if (lookupError || !targetProfile) {
      setError('No user found with that username')
      return
    }

    const { error: addError } = await supabase.from('group_members').insert({
      group_id: id,
      user_id: targetProfile.id,
    })

    if (addError) {
      setError(addError.message)
    } else {
      setUsernameToAdd('')
      loadGroup()
    }
  }

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        {groupName}
      </h1>

      <h2
        className="text-sm mb-3 pb-2 border-b"
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)', borderColor: 'var(--color-rule)' }}
      >
        Members
      </h2>
      <div className="mb-8">
        {members.map((m) => (
          <div key={m.user_id} className="py-2">
            {m.profiles?.display_name || m.profiles?.username}
          </div>
        ))}
      </div>

      {isOwner && (
        <form onSubmit={handleAddMember} style={{ fontFamily: 'var(--font-sans)' }}>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Add member by username</label>
          <input
            type="text"
            value={usernameToAdd}
            onChange={(e) => setUsernameToAdd(e.target.value)}
            className="w-full py-2 border-b bg-transparent focus:outline-none mb-3"
            style={{ borderColor: 'var(--color-rule)' }}
          />
          {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
          <button
            type="submit"
            className="px-5 py-2 text-sm"
            style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            Add member
          </button>
        </form>
      )}
    </main>
  )
}