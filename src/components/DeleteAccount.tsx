'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccount() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setDeleting(false)
      setError('You are not signed in.')
      return
    }

    // Best effort: remove this user's uploaded photos and images.
    // A failure here must not block deleting the account itself.
    try {
      const { data: files } = await supabase.storage.from('post-media').list(user.id, { limit: 1000 })
      if (files && files.length > 0) {
        await supabase.storage.from('post-media').remove(files.map((f) => `${user.id}/${f.name}`))
      }
    } catch {}

    const { error: rpcError } = await supabase.rpc('delete_own_account')
    if (rpcError) {
      setDeleting(false)
      setError(rpcError.message)
      return
    }

    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      <p className="text-sm mb-4" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
        Permanently delete your account and everything in it: your profile, projects, word counts,
        posts, messages, and any groups or sprints you created. This cannot be undone.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-5 py-2 text-sm"
          style={{ border: '1px solid #a33', color: '#a33', borderRadius: 4 }}
        >
          Delete account
        </button>
      ) : (
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
            Type DELETE to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            className="w-full py-2 mb-4 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
          {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || confirmText.trim().toUpperCase() !== 'DELETE'}
              className="px-5 py-2 text-sm"
              style={{
                backgroundColor: '#a33',
                color: '#fff',
                borderRadius: 4,
                opacity: deleting || confirmText.trim().toUpperCase() !== 'DELETE' ? 0.5 : 1,
              }}
            >
              {deleting ? 'Deleting...' : 'Delete my account forever'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setConfirmText(''); setError(null) }}
              disabled={deleting}
              className="px-5 py-2 text-sm"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
