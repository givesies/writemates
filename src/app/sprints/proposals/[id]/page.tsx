'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Option = {
  id: string
  start_time: string
  suggested_by: string
}

type Vote = {
  option_id: string
  user_id: string
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
}

export default function SprintProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [userId, setUserId] = useState<string | null>(null)
  const [groupName, setGroupName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [status, setStatus] = useState('voting')
  const [resolvedSprintId, setResolvedSprintId] = useState<string | null>(null)
  const [options, setOptions] = useState<Option[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [suggesting, setSuggesting] = useState(false)
  const [newTimeLocal, setNewTimeLocal] = useState('')
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState(false)
  const router = useRouter()

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    const { data: proposal } = await supabase
      .from('sprint_proposals')
      .select('duration_minutes, creator_id, status, resolved_sprint_id, groups(name)')
      .eq('id', id)
      .single()

    if (proposal) {
      setDurationMinutes(proposal.duration_minutes)
      setCreatorId(proposal.creator_id)
      setStatus(proposal.status)
      setResolvedSprintId(proposal.resolved_sprint_id)
      const g = proposal.groups as unknown as { name: string } | null
      setGroupName(g?.name || 'Sprint')

      if (proposal.status === 'resolved' && proposal.resolved_sprint_id) {
        router.push(`/sprints/${proposal.resolved_sprint_id}`)
        return
      }
    }

    const { data: optionData } = await supabase
      .from('sprint_time_options')
      .select('id, start_time, suggested_by')
      .eq('proposal_id', id)
      .order('start_time', { ascending: true })

    setOptions(optionData || [])

    const { data: voteData } = await supabase
      .from('sprint_time_votes')
      .select('option_id, user_id, profiles(username, display_name, avatar_url)')
      .eq('proposal_id', id)

    setVotes((voteData as unknown as Vote[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [id])

  function votesFor(optionId: string) {
    return votes.filter((v) => v.option_id === optionId)
  }

  function myVote() {
    return votes.find((v) => v.user_id === userId)
  }

  async function handleVote(optionId: string) {
    if (!userId) return
    const supabase = createClient()

    const existing = myVote()
    if (existing) {
      await supabase
        .from('sprint_time_votes')
        .update({ option_id: optionId })
        .eq('proposal_id', id)
        .eq('user_id', userId)
    } else {
      await supabase.from('sprint_time_votes').insert({
        proposal_id: id,
        option_id: optionId,
        user_id: userId,
      })
    }
    load()
  }

  async function handleSuggest() {
    if (!newTimeLocal || !userId) return
    const supabase = createClient()
    const startTime = new Date(newTimeLocal).toISOString()

    await supabase.from('sprint_time_options').insert({
      proposal_id: id,
      start_time: startTime,
      suggested_by: userId,
    })

    setSuggesting(false)
    setNewTimeLocal('')
    load()
  }

  function leadingOption(): Option | null {
    if (options.length === 0) return null
    let best = options[0]
    let bestCount = votesFor(options[0].id).length
    for (const opt of options.slice(1)) {
      const count = votesFor(opt.id).length
      if (count > bestCount) {
        best = opt
        bestCount = count
      }
    }
    return best
  }

  async function handleFinalize() {
    const leading = leadingOption()
    if (!leading || !userId) return
    setFinalizing(true)

    const supabase = createClient()

    const { data: proposal } = await supabase
      .from('sprint_proposals')
      .select('group_id')
      .eq('id', id)
      .single()

    if (!proposal) {
      setFinalizing(false)
      return
    }

    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert({
        group_id: proposal.group_id,
        creator_id: userId,
        duration_minutes: durationMinutes,
        starts_at: leading.start_time,
      })
      .select()
      .single()

    if (error || !sprint) {
      setFinalizing(false)
      return
    }

    await supabase
      .from('sprint_proposals')
      .update({ status: 'resolved', resolved_sprint_id: sprint.id })
      .eq('id', id)

    router.push(`/sprints/${sprint.id}`)
  }

  function initials(name: string) {
    return name.charAt(0).toUpperCase()
  }

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  const leading = leadingOption()
  const isCreator = userId === creatorId
  const mine = myVote()

  return (
    <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
      <p className="text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
        {groupName} · {durationMinutes} minute sprint
      </p>
      <h1 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        When should we sprint?
      </h1>

      <div className="mb-4">
        {options.map((option) => {
          const optionVotes = votesFor(option.id)
          const isMine = mine?.option_id === option.id
          return (
            <div
              key={option.id}
              className="flex items-center justify-between py-3 px-3 mb-2"
              style={{ backgroundColor: 'var(--color-paper-raised)', borderRadius: 8 }}
            >
              <div>
                <p className="text-sm">
                  {new Date(option.start_time).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
                <div className="flex gap-1 mt-1">
                  {optionVotes.slice(0, 5).map((v) => (
                    <div
                      key={v.user_id}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: 'var(--color-rule)', overflow: 'hidden' }}
                    >
                      {v.profiles?.avatar_url ? (
                        <img src={v.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        initials(v.profiles?.display_name || v.profiles?.username || '?')
                      )}
                    </div>
                  ))}
                  {optionVotes.length === 0 && (
                    <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>No votes yet</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleVote(option.id)}
                className="text-sm px-3 py-1"
                style={
                  isMine
                    ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)', borderRadius: 6 }
                    : { border: '1px solid var(--color-rule)', color: 'var(--color-ink-muted)', borderRadius: 6 }
                }
              >
                {isMine ? 'Voted' : 'Vote'}
              </button>
            </div>
          )
        })}
      </div>

      {!suggesting ? (
        <button
          onClick={() => setSuggesting(true)}
          className="w-full text-sm py-2 mb-6"
          style={{ border: '1px dashed var(--color-rule)', color: 'var(--color-ink-muted)', borderRadius: 8 }}
        >
          + Suggest a different time
        </button>
      ) : (
        <div className="mb-6">
          <input
            type="datetime-local"
            value={newTimeLocal}
            onChange={(e) => setNewTimeLocal(e.target.value)}
            className="w-full py-2 mb-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSuggest}
              className="text-sm px-4 py-2"
              style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              Add time
            </button>
            <button
              onClick={() => setSuggesting(false)}
              className="text-sm px-4 py-2"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isCreator && leading && (
        <div className="pt-5" style={{ borderTop: '0.5px solid var(--color-rule)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--color-ink-muted)' }}>You created this poll</p>
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="w-full text-sm py-3"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)', borderRadius: 8 }}
          >
            {finalizing ? 'Finalizing...' : `Finalize: ${new Date(leading.start_time).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}`}
          </button>
        </div>
      )}
    </main>
  )
}
