'use client'

import { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { parseBackfillText, type BackfillEntry } from '@/lib/backfill'

export default function BackfillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [step, setStep] = useState<'input' | 'review' | 'done'>('input')
  const [text, setText] = useState('')
  const [anchor, setAnchor] = useState('')
  const [parsed, setParsed] = useState<BackfillEntry[]>([])
  const [hasAttemptedParse, setHasAttemptedParse] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleParse() {
    const result = parseBackfillText(text)
    setParsed(result)
    setHasAttemptedParse(true)
    setError(null)
    if (result.length > 0) setStep('review')
  }

  async function handleSave() {
    if (parsed.length === 0) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let running = 0
    const cumulative: { date: string; total: number }[] = []
    for (const entry of parsed) {
      running += entry.delta
      cumulative.push({ date: entry.date, total: running })
    }

    const anchorValue = anchor ? parseInt(anchor.replace(/,/g, ''), 10) : null
    if (anchorValue !== null && !isNaN(anchorValue)) {
      const offset = anchorValue - cumulative[cumulative.length - 1].total
      for (const c of cumulative) c.total = Math.max(0, c.total + offset)
    }

    const { data: existing } = await supabase
      .from('wordcount_snapshots')
      .select('id, recorded_at')
      .eq('project_id', id)

    const backfillDateSet = new Set(cumulative.map((c) => c.date))
    const idsToDelete = (existing || [])
      .filter((row) => backfillDateSet.has(new Date(row.recorded_at).toISOString().split('T')[0]))
      .map((row) => row.id)

    if (idsToDelete.length > 0) {
      await supabase.from('wordcount_snapshots').delete().in('id', idsToDelete)
    }

    const rows = cumulative.map((c) => ({
      project_id: id,
      user_id: user.id,
      word_count: c.total,
      source: 'backfill',
      recorded_at: `${c.date}T12:00:00`,
    }))

    const { error } = await supabase.from('wordcount_snapshots').insert(rows)
    setSaving(false)

    if (error) {
      setError(error.message)
    } else {
      setStep('done')
    }
  }

  if (step === 'done') {
    return (
      <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
        <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
          Backfilled
        </h1>
        <p className="mb-6" style={{ color: 'var(--color-ink-muted)' }}>
          {parsed.length} days added to your history. Your graphs and finish date will reflect them now.
        </p>
        <button
          onClick={() => router.push(`/projects/${id}`)}
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Back to project
        </button>
      </main>
    )
  }

  if (step === 'review') {
    return (
      <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
        <h1 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
          Found {parsed.length} days
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--color-ink-muted)' }}>
          Here&apos;s what we&apos;ll add. Re-adding a day you&apos;ve already backfilled will overwrite it, not stack on top.
        </p>

        <div className="rounded border mb-4" style={{ borderColor: 'var(--color-rule)', maxHeight: 320, overflowY: 'auto' }}>
          {parsed.map((p) => (
            <div
              key={p.date}
              className="flex justify-between px-3 py-2 text-sm border-b"
              style={{ borderColor: 'var(--color-rule)' }}
            >
              <span>{new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span style={{ color: p.delta < 0 ? '#a33' : 'var(--color-ink)' }}>
                {p.delta > 0 ? '+' : ''}{p.delta.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div
          className="rounded-lg mb-4"
          style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.9rem 1rem' }}
        >
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
            Your real, current word count
          </label>
          <p className="text-sm mb-3" style={{ color: 'var(--color-ink-muted)' }}>
            Scrivener&apos;s writing-history log can drift from your actual manuscript over time (moved documents, restructuring, etc. don&apos;t always get tracked). To get the true number: in Scrivener, go to <strong>Project → Project Statistics</strong> and use the <strong>Words</strong> figure shown there — not the history dialog.
          </p>
          <input
            type="number"
            value={anchor}
            onChange={(e) => setAnchor(e.target.value)}
            placeholder="e.g. 34000"
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>

        {error && <p className="mb-3 text-sm" style={{ color: '#a33' }}>{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)' }}
          >
            {saving ? 'Saving...' : `Save ${parsed.length} days`}
          </button>
          <button
            onClick={() => setStep('input')}
            className="px-5 py-2 text-sm"
            style={{ color: 'var(--color-ink-muted)' }}
          >
            Back
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
      <h1 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Backfill past progress
      </h1>

      <p className="text-sm mb-2" style={{ color: 'var(--color-ink-muted)' }}>
        To import your writing history from Scrivener:
      </p>
      <ol className="text-sm mb-4 pl-5" style={{ color: 'var(--color-ink-muted)', listStyle: 'decimal' }}>
        <li className="mb-1">Click <strong>Project</strong> in the top bar</li>
        <li className="mb-1">Click <strong>Writing History</strong></li>
        <li className="mb-1">Click <strong>Export</strong></li>
        <li>Open the file, copy the two date and word-count columns, and paste them below</li>
      </ol>

      <button
        onClick={() => router.push(`/projects/${id}`)}
        className="text-sm mb-6"
        style={{ color: 'var(--color-ink-muted)', textDecoration: 'underline' }}
      >
        Skip for now
      </button>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setHasAttemptedParse(false)
        }}
        rows={8}
        placeholder="Paste your Scrivener writing history here..."
        className="w-full p-3 mb-4 rounded border focus:outline-none"
        style={{ borderColor: 'var(--color-rule)', backgroundColor: 'transparent' }}
      />

      {hasAttemptedParse && parsed.length === 0 && (
        <p className="text-sm mb-4" style={{ color: '#a33' }}>
          Couldn&apos;t find any valid date/word-count lines in that text — check the format and try again.
        </p>
      )}

      <button
        onClick={handleParse}
        className="px-5 py-2 text-sm"
        style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        Preview
      </button>
    </main>
  )
}
