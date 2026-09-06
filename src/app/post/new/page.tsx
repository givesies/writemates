'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      type: linkUrl ? 'link' : 'snippet',
      content: content || null,
      link_url: linkUrl || null,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h1>Share something</h1>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        This will be visible to everyone for now — group/individual sharing is coming soon.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Text (a snippet, thought, update...)</label><br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Link (optional — e.g. your Substack post)</label><br />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={saving} style={{ padding: '0.5rem 1rem' }}>
          {saving ? 'Posting...' : 'Post'}
        </button>
      </form>
    </main>
  )
}
