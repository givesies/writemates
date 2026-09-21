'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Group = { id: string; name: string }
type Proposal = { id: string; group_id: string; duration_minutes: number; status: string; groups: { name: string } | null }

const DURATIONS = [15, 25, 45, 60]

function defaultDateTimeLocal() {
  const d = new Date(Date.now() + 15 * 60000)
  d.setSeconds(0, 0)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function SprintsListPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [duration, setDuration] = useState(25)
  const [whenLocal, setWhenLocal] = useState(defaultDateTimeLocal())
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: groupData } = await supabase.from('groups').select('id, name')
    setGroups(groupData || [])
    if (groupData && groupData.length > 0) setSelectedGroupId(groupData[0].id)

    const { data: proposalData } = await supabase
      .from('sprint_proposals')
      .select('id, group_id, duration_minutes, status, groups(name)')
      .order('created_at', { ascending: false })
      .limit(20)

    setProposals((proposalData as unknown as Proposal[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handlePropose(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedGroupId) return
    setStarting(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: proposal, error: proposalError } = await supabase
      .from('sprint_proposals')
      .insert({
        group_id: selectedGroupId,
        creator_id: user.id,
        duration_minutes: duration,
      })
      .select()
      .single()

    if (proposalError || !proposal) {
      setStarting(false)
      setError(proposalError?.message || 'Something went wrong')
      return
    }

    const startsAt = new Date(whenLocal).toISOString()

    const { error: optionError } = await supabase.from('sprint_time_options').insert({
      proposal_id: proposal.id,
      start_time: startsAt,
      suggested_by: user.id,
    })

    setStarting(false)

    if (optionError) {
      setError(optionError.message)
    } else {
      router.push(`/sprints/proposals/${proposal.id}`)
    }
  }

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  return (
    <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
      <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Sprints
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-ink-muted)' }}>
        No scores, no ranking. Just time at the desk, together.
      </p>

      {groups.length === 0 ? (
        <p className="text-sm mb-10" style={{ color: 'var(--color-ink-muted)' }}>
          You need a group before you can propose a sprint — create one in Groups first.
        </p>
      ) : (
        <form onSubmit={handlePropose} className="mb-10 pb-8 border-b" style={{ borderColor: 'var(--color-rule)' }}>
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Group</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
          <div className="mb-5">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Suggested time</label>
            <input
              type="datetime-local"
              value={whenLocal}
              onChange={(e) => setWhenLocal(e.target.value)}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
          {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
          <button
            type="submit"
            disabled={starting}
            className="px-5 py-2 text-sm"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)' }}
          >
            {starting ? 'Proposing...' : 'Propose sprint'}
          </button>
        </form>
      )}

      {proposals.length > 0 && (
        <div>
          <h2 className="text-sm mb-3" style={{ color: 'var(--color-ink-muted)' }}>Recent sprints</h2>
          {proposals.map((proposal) => (
            <Link
              key={proposal.id}
              href={proposal.status === 'voting' ? `/sprints/proposals/${proposal.id}` : `/sprints/${proposal.id}`}
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--color-rule)' }}
            >
              <span>{proposal.groups?.name || 'Sprint'} · {proposal.duration_minutes}m</span>
              <span className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                {proposal.status === 'voting' ? 'Voting' : proposal.status === 'resolved' ? 'Scheduled' : proposal.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
