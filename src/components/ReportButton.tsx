'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const REASONS = [
  'Spam or scam',
  'Harassment or bullying',
  'Hateful or abusive',
  'Sexual or explicit content',
  'Something else',
]

// Lets a signed-in user report a post or a person. Reports are saved to the
// `reports` table for review.
export default function ReportButton({
  reportedUserId,
  postId,
  label = 'Report',
  className = '',
}: {
  reportedUserId: string
  postId?: string
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0])
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSending(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSending(false)
      setError('Please log in to report.')
      return
    }
    const { error: insertError } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      post_id: postId ?? null,
      reason,
    })
    setSending(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <span className={`text-sm ${className}`} style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
        Reported. We’ll review it within 24 hours.
      </span>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 text-sm ${className}`}
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
      >
        <Flag size={16} />
        {label}
      </button>
    )
  }

  return (
    <div
      className={`w-full mt-3 p-3 rounded-lg text-sm ${className}`}
      style={{ fontFamily: 'var(--font-sans)', border: '1px solid var(--color-rule)', flexBasis: '100%' }}
    >
      <label className="block mb-2" style={{ color: 'var(--color-ink-muted)' }}>
        What’s wrong?
      </label>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full py-2 mb-3 border-b bg-transparent focus:outline-none"
        style={{ borderColor: 'var(--color-rule)' }}
      >
        {REASONS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {error && <p className="mb-2" style={{ color: '#a33' }}>{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={sending}
          className="px-4 py-1.5"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)', borderRadius: 4 }}
        >
          {sending ? 'Sending...' : 'Send report'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={sending}
          className="px-4 py-1.5"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
