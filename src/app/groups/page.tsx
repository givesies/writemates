'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Group = {
  id: string
  name: string
  owner_id: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  async function loadGroups() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
    setGroups(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadGroups()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: newGroup, error: groupError } = await supabase
      .from('groups')
      .insert({ owner_id: user.id, name })
      .select()
      .single()

    if (groupError) {
      setError(groupError.message)
      return
    }

    await supabase.from('group_members').insert({
      group_id: newGroup.id,
      user_id: user.id,
    })

    setName('')
    loadGroups()
  }

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Your groups
      </h1>

      <form onSubmit={handleCreate} className="mb-10 pb-8 border-b" style={{ borderColor: 'var(--color-rule)', fontFamily: 'var(--font-sans)' }}>
        <div className="mb-4">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Group name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
        <button
          type="submit"
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Create group
        </button>
      </form>

      {groups.length === 0 && (
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          No groups yet — create one above.
        </p>
      )}
      <div>
        {groups.map((group) => (
          <div key={group.id} className="py-4 border-b" style={{ borderColor: 'var(--color-rule)' }}>
            <Link href={`/groups/${group.id}`} className="text-lg">{group.name}</Link>
            {group.owner_id === userId && (
              <span className="text-sm ml-2" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                (you own this)
              </span>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}