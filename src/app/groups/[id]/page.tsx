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

  if (loading) return <main style={{ padding: '2rem' }}>Loading...</main>

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h1>{groupName}</h1>

      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Members</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {members.map((m) => (
          <li key={m.user_id} style={{ padding: '0.5rem 0' }}>
            {m.profiles?.display_name || m.profiles?.username}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={handleAddMember} style={{ marginTop: '1.5rem' }}>
          <label>Add member by username</label><br />
          <input
            type="text"
            value={usernameToAdd}
            onChange={(e) => setUsernameToAdd(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>Add member</button>
        </form>
      )}
    </main>
  )
}