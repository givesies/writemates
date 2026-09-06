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

    // Add the owner as a member too, so they count as "in" the group for sharing purposes
    await supabase.from('group_members').insert({
      group_id: newGroup.id,
      user_id: user.id,
    })

    setName('')
    loadGroups()
  }

  if (loading) return <main style={{ padding: '2rem' }}>Loading...</main>

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h1>Your groups</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Group name</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Create group</button>
      </form>

      <h2>Existing groups</h2>
      {groups.length === 0 && <p>No groups yet — create one above.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {groups.map((group) => (
          <li
            key={group.id}
            style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '0.75rem' }}
          >
            <Link href={`/groups/${group.id}`} style={{ fontWeight: 'bold' }}>{group.name}</Link>
            {group.owner_id === userId && <span style={{ color: '#666' }}> (you own this)</span>}
          </li>
        ))}
      </ul>
    </main>
  )
}