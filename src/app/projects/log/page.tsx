'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { buildDailyCumulative, buildDailyDeltas } from '@/lib/wordcountStats'
import { parseBackfillText, type BackfillEntry } from '@/lib/backfill'
import { getRandomQuote, type Quote } from '@/lib/quotes'

type Project = {
  id: string
  title: string
  metric_unit: string
}

export default function LogWordcountPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [currentTotal, setCurrentTotal] = useState(0)
  const [delta, setDelta] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingTotal, setLoadingTotal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [showMultiDay, setShowMultiDay] = useState(false)
  const [multiDayText, setMultiDayText] = useState('')
  const [parsedDays, setParsedDays] = useState<BackfillEntry[]>([])
  const [savingMulti, setSavingMulti] = useState(false)

  const [quote, setQuote] = useState<Quote | null>(null)

  const router = useRouter()

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase.from('projects').select('id, title, metric_unit')
      setProjects(data || [])
      if (data && data.length > 0) setProjectId(data[0].id)
      setLoading(false)
    }
    loadProjects()
  }, [router])

  useEffect(() => {
    if (!projectId) return
    async function loadCurrentTotal() {
      setLoadingTotal(true)
      const supabase = createClient()
      const { data: snapshots } = await supabase
        .from('wordcount_snapshots')
        .select('word_count, recorded_at')
        .eq('project_id', projectId)
        .order('recorded_at', { ascending: true })

      const dailyMap = buildDailyCumulative(snapshots || [])
      const values = Array.from(dailyMap.values())
      setCurrentTotal(values.length > 0 ? values[values.length - 1] : 0)
      setLoadingTotal(false)
    }
    loadCurrentTotal()
  }, [projectId])

  async function refreshTodaysPost(supabase: ReturnType<typeof createClient>, userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const { data: allSnapshots } = await supabase
      .from('wordcount_snapshots')
      .select('word_count, recorded_at')
      .eq('project_id', projectId)
      .order('recorded_at', { ascending: true })

    const dailyMap = buildDailyCumulative(allSnapshots || [])
    const dailyDeltas = buildDailyDeltas(dailyMap)
    const todaysTotal = dailyDeltas.get(today) || 0

    if (todaysTotal > 0) {
      await supabase.from('posts').upsert(
        {
          user_id: userId,
          project_id: projectId,
          type: 'wordcount',
          word_count: todaysTotal,
          entry_date: today,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,project_id,entry_date,type' }
      )
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const deltaNum = parseInt(delta.replace(/,/g, ''), 10)
    if (isNaN(deltaNum)) {
      setSaving(false)
      setMessage('Enter a number')
      return
    }

    const newTotal = Math.max(0, currentTotal + deltaNum)

    const { error: snapshotError } = await supabase.from('wordcount_snapshots').insert({
      project_id: projectId,
      user_id: user.id,
      word_count: newTotal,
      source: 'manual',
    })

    if (snapshotError) {
      setSaving(false)
      setMessage(`Error: ${snapshotError.message}`)
      return
    }

    await refreshTodaysPost(supabase, user.id)

    setSaving(false)
    setQuote(getRandomQuote())
  }

  function handleParseMultiDay() {
    setParsedDays(parseBackfillText(multiDayText))
  }

  async function handleSaveMultiDay() {
    if (parsedDays.length === 0) return
    setSavingMulti(true)
    setMessage(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const sorted = [...parsedDays].sort((a, b) => (a.date < b.date ? -1 : 1))
    let running = currentTotal
    const cumulative: { date: string; total: number }[] = []
    for (const entry of sorted) {
      running += entry.delta
      cumulative.push({ date: entry.date, total: Math.max(0, running) })
    }

    const { data: existing } = await supabase
      .from('wordcount_snapshots')
      .select('id, recorded_at')
      .eq('project_id', projectId)

    const dateSet = new Set(cumulative.map((c) => c.date))
    const idsToDelete = (existing || [])
      .filter((row) => dateSet.has(new Date(row.recorded_at).toISOString().split('T')[0]))
      .map((row) => row.id)

    if (idsToDelete.length > 0) {
      await supabase.from('wordcount_snapshots').delete().in('id', idsToDelete)
    }

    const rows = cumulative.map((c) => ({
      project_id: projectId,
      user_id: user.id,
      word_count: c.total,
      source: 'manual',
      recorded_at: `${c.date}T12:00:00`,
    }))

    const { error } = await supabase.from('wordcount_snapshots').insert(rows)

    if (error) {
      setSavingMulti(false)
      setMessage(error.message)
      return
    }

    await refreshTodaysPost(supabase, user.id)

    setSavingMulti(false)
    setQuote(getRandomQuote())
  }

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  if (quote) {
    return (
      <main className="max-w-md mx-auto px-6 py-16 text-center" style={{ fontFamily: 'var(--font-sans)' }}>
        <p
          className="mb-4"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', lineHeight: 1.5, color: 'var(--color-ink)' }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-sm mb-10" style={{ color: 'var(--color-ink-muted)' }}>
          — {quote.author}
        </p>
        <button
          onClick={() => { router.push('/today'); router.refresh() }}
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Continue to Today
        </button>
      </main>
    )
  }

  if (projects.length === 0) {
    return (
      <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
        <p style={{ color: 'var(--color-ink-muted)' }}>
          You need to create a project first before logging your writing.
        </p>
      </main>
    )
  }

  const project = projects.find((p) => p.id === projectId)
  const unit = project?.metric_unit || 'words'

  return (
    <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
      <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Add today&apos;s words
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-muted)' }}>
        Tell us how much you wrote — we&apos;ll add it to your total.
      </p>

      <div className="mb-5">
        <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Project</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full py-2 border-b bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--color-rule)' }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--color-ink-muted)' }}>
        Current total: {loadingTotal ? '...' : <strong style={{ color: 'var(--color-ink)' }}>{currentTotal.toLocaleString()} {unit}</strong>}
      </p>

      {!showMultiDay ? (
        <>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
                How many {unit} did you write today?
              </label>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                required
                placeholder="e.g. 500"
                className="w-full py-2 border-b bg-transparent focus:outline-none"
                style={{ borderColor: 'var(--color-rule)' }}
              />
            </div>
            <p className="text-xs mb-6" style={{ color: 'var(--color-ink-muted)' }}>
              Cut some text instead? Enter a negative number.
            </p>

            {message && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{message}</p>}
            <button
              type="submit"
              disabled={saving || loadingTotal}
              className="px-5 py-2 text-sm"
              style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              {saving ? 'Saving...' : 'Add to total'}
            </button>
          </form>

          <button
            onClick={() => setShowMultiDay(true)}
            className="text-sm mt-6"
            style={{ color: 'var(--color-accent)' }}
          >
            Missed a few days? Add multiple days at once
          </button>
        </>
      ) : (
        <div>
          <p className="text-sm mb-2" style={{ color: 'var(--color-ink-muted)' }}>
            Paste one line per missed day. Each number is how many {unit} you wrote that day — for example:
          </p>
          <pre
            className="text-sm mb-4 p-3 rounded"
            style={{ backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-ink-muted)' }}
          >
{`Sep 20, 500
Sep 21, 300
Sep 22, 800`}
          </pre>

          <textarea
            value={multiDayText}
            onChange={(e) => setMultiDayText(e.target.value)}
            rows={6}
            placeholder="Paste your missed days here..."
            className="w-full p-3 mb-4 rounded border focus:outline-none"
            style={{ borderColor: 'var(--color-rule)', backgroundColor: 'transparent' }}
          />

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleParseMultiDay}
              className="px-4 py-2 text-sm"
              style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              Preview
            </button>
            <button
              onClick={() => { setShowMultiDay(false); setParsedDays([]); setMultiDayText('') }}
              className="px-4 py-2 text-sm"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              Back to single day
            </button>
          </div>

          {parsedDays.length > 0 && (
            <div className="mb-6">
              <p className="text-sm mb-2" style={{ color: 'var(--color-ink-muted)' }}>
                Found {parsedDays.length} days:
              </p>
              <div className="rounded border mb-4" style={{ borderColor: 'var(--color-rule)' }}>
                {parsedDays.map((p) => (
                  <div
                    key={p.date}
                    className="flex justify-between px-3 py-2 text-sm border-b"
                    style={{ borderColor: 'var(--color-rule)' }}
                  >
                    <span>{new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span style={{ color: p.delta < 0 ? '#a33' : 'var(--color-ink)' }}>
                      {p.delta > 0 ? '+' : ''}{p.delta.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {message && <p className="mb-3 text-sm" style={{ color: '#a33' }}>{message}</p>}

              <button
                onClick={handleSaveMultiDay}
                disabled={savingMulti}
                className="px-5 py-2 text-sm"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)' }}
              >
                {savingMulti ? 'Saving...' : `Add ${parsedDays.length} days`}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
