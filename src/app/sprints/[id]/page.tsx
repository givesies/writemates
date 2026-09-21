'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { buildDailyCumulative } from '@/lib/wordcountStats'

type Participant = {
  user_id: string
  project_id: string | null
  start_wordcount: number | null
  end_wordcount: number | null
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
}

type Project = { id: string; title: string }

export default function SprintViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [userId, setUserId] = useState<string | null>(null)
  const [groupName, setGroupName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [startsAt, setStartsAt] = useState<string | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [endCountInput, setEndCountInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    const { data: sprint } = await supabase
      .from('sprints')
      .select('duration_minutes, starts_at, groups(name)')
      .eq('id', id)
      .single()

    if (sprint) {
      setDurationMinutes(sprint.duration_minutes)
      setStartsAt(sprint.starts_at)
      const g = sprint.groups as unknown as { name: string } | null
      setGroupName(g?.name || 'Sprint')
    }

    const { data: participantData } = await supabase
      .from('sprint_participants')
      .select('user_id, project_id, start_wordcount, end_wordcount, profiles(username, display_name, avatar_url)')
      .eq('sprint_id', id)

    setParticipants((participantData as unknown as Participant[]) || [])

    const { data: projects } = await supabase.from('projects').select('id, title').eq('user_id', user.id)
    setMyProjects(projects || [])
    if (projects && projects.length > 0) setSelectedProjectId(projects[0].id)

    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick)
  }, [])

  const me = participants.find((p) => p.user_id === userId)
  const startsAtMs = startsAt ? new Date(startsAt).getTime() : 0
  const endsAtMs = startsAtMs + durationMinutes * 60000
  const hasStarted = startsAt !== null && now >= startsAtMs
  const isOver = startsAt !== null && now >= endsAtMs

  const untilStartMs = Math.max(0, startsAtMs - now)
  const untilStartMinutes = Math.floor(untilStartMs / 60000)
  const untilStartSeconds = Math.floor((untilStartMs % 60000) / 1000)

  const remainingMs = Math.max(0, endsAtMs - now)
  const minutesLeft = Math.floor(remainingMs / 60000)
  const secondsLeft = Math.floor((remainingMs % 60000) / 1000)

  async function handleJoin() {
    if (!selectedProjectId || !userId) return
    setError(null)

    const supabase = createClient()
    const { data: snapshots } = await supabase
      .from('wordcount_snapshots')
      .select('word_count, recorded_at')
      .eq('project_id', selectedProjectId)

    const dailyMap = buildDailyCumulative(snapshots || [])
    const values = Array.from(dailyMap.values())
    const currentTotal = values.length > 0 ? values[values.length - 1] : 0

    const { error } = await supabase.from('sprint_participants').insert({
      sprint_id: id,
      user_id: userId,
      project_id: selectedProjectId,
      start_wordcount: currentTotal,
    })

    if (error) {
      setError(error.message)
    } else {
      load()
    }
  }

  async function handleLogEnd() {
    if (!me || !endCountInput) return
    setError(null)

    const supabase = createClient()
    const endCount = parseInt(endCountInput.replace(/,/g, ''), 10)
    if (isNaN(endCount)) return

    await supabase
      .from('sprint_participants')
      .update({ end_wordcount: endCount })
      .eq('sprint_id', id)
      .eq('user_id', userId)

    if (me.project_id) {
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('wordcount_snapshots').insert({
        project_id: me.project_id,
        user_id: userId,
        word_count: endCount,
        source: 'sprint',
      })
      await supabase.from('posts').upsert(
        {
          user_id: userId,
          project_id: me.project_id,
          type: 'wordcount',
          word_count: endCount,
          entry_date: today,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,project_id,entry_date,type' }
      )
    }

    load()
  }

  function initials(name: string) {
    return name.charAt(0).toUpperCase()
  }

  async function handleShare() {
    if (!me || me.end_wordcount === null || me.start_wordcount === null) return
    const words = me.end_wordcount - me.start_wordcount
    const text = `I just wrote ${words.toLocaleString()} words in a Writemates sprint!`
    const nav = navigator as Navigator & { share?: (data: { text: string }) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ text })
      } catch {
        // cancelled, nothing to do
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  const myWords = me && me.end_wordcount !== null && me.start_wordcount !== null
    ? me.end_wordcount - me.start_wordcount
    : null

  return (
    <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
      <h1 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        {groupName}
      </h1>

      {!hasStarted && (
        <div
          className="rounded-lg text-center mb-6"
          style={{ backgroundColor: 'var(--color-paper-raised)', padding: '1.5rem' }}
        >
          <p className="text-sm mb-2" style={{ color: 'var(--color-ink-muted)' }}>
            {groupName} · {durationMinutes} minute sprint
          </p>
          <p className="text-lg mb-1">
            {startsAt && new Date(startsAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
          </p>
          <p className="text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-accent)' }}>
            starts in {untilStartMinutes}:{untilStartSeconds.toString().padStart(2, '0')}
          </p>
          <div className="flex justify-center gap-2 mb-2">
            {participants.map((p) => (
              <div
                key={p.user_id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: 'var(--color-paper)',
                  border: '2px solid var(--color-accent)',
                  color: 'var(--color-accent)',
                  overflow: 'hidden',
                }}
              >
                {p.profiles?.avatar_url ? (
                  <img src={p.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials(p.profiles?.display_name || p.profiles?.username || '?')
                )}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            {participants.length} mate{participants.length === 1 ? ' is' : 's are'} in
          </p>
        </div>
      )}

      {hasStarted && !isOver && (
        <div
          className="rounded-lg text-center mb-6"
          style={{ backgroundColor: 'var(--color-paper-raised)', padding: '1.5rem' }}
        >
          <p className="text-sm mb-2" style={{ color: 'var(--color-ink-muted)' }}>
            {groupName} · sprinting together
          </p>
          <p className="text-3xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-accent)' }}>
            {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}
          </p>
          <div className="flex justify-center gap-2 mb-2">
            {participants.map((p) => (
              <div
                key={p.user_id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: 'var(--color-paper)',
                  border: '2px solid var(--color-accent)',
                  color: 'var(--color-accent)',
                  overflow: 'hidden',
                }}
              >
                {p.profiles?.avatar_url ? (
                  <img src={p.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials(p.profiles?.display_name || p.profiles?.username || '?')
                )}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            {participants.length} mate{participants.length === 1 ? ' is' : 's are'} writing right now
          </p>
        </div>
      )}

      {isOver && (
        <div
          className="rounded-lg text-center mb-6"
          style={{ backgroundColor: 'var(--color-paper-raised)', padding: '1.5rem' }}
        >
          <p className="text-lg mb-2">
            {participants.length} mate{participants.length === 1 ? '' : 's'} just wrote together for {durationMinutes} minutes.
          </p>
          {myWords !== null ? (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--color-ink-muted)' }}>
                You wrote {myWords.toLocaleString()} words. Only you can see that.
              </p>
              <button
                onClick={handleShare}
                className="px-4 py-2 text-sm"
                style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
              >
                Share if you like
              </button>
            </>
          ) : me ? (
            <div className="mt-4 text-left">
              <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
                What&apos;s your total word count now?
              </label>
              <input
                type="number"
                value={endCountInput}
                onChange={(e) => setEndCountInput(e.target.value)}
                className="w-full py-2 mb-3 border-b bg-transparent focus:outline-none"
                style={{ borderColor: 'var(--color-rule)' }}
              />
              <button
                onClick={handleLogEnd}
                className="px-4 py-2 text-sm"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)' }}
              >
                Log my count
              </button>
            </div>
          ) : null}
        </div>
      )}

      <p className="text-sm text-center mb-6" style={{ color: 'var(--color-ink-muted)' }}>
        No scores, no ranking. Just time at the desk, together.
      </p>

      {!me && myProjects.length > 0 && !isOver && (
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
            Which project are you sprinting on?
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full py-2 mb-3 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          >
            {myProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          {error && <p className="mb-3 text-sm" style={{ color: '#a33' }}>{error}</p>}
          <button
            onClick={handleJoin}
            className="w-full px-5 py-2 text-sm"
            style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            {hasStarted ? 'Join sprint' : "I'm in"}
          </button>
        </div>
      )}
    </main>
  )
}
