'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setStatus(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('support_requests').insert({
      user_id: user.id,
      message,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
    } else {
      setStatus('Your message has been sent. We\'ll get back to you soon.')
      setMessage('')
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Settings
      </h1>

      <h2
        className="text-sm mb-4 pb-2 border-b"
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)', borderColor: 'var(--color-rule)' }}
      >
        Contact support
      </h2>

      <form onSubmit={handleSubmit} style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
            What can we help with?
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
        {status && <p className="mb-4 text-sm" style={{ color: 'var(--color-accent)' }}>{status}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          {saving ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </main>
  )
}