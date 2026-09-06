'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Project = {
  id: string
  title: string
}

export default function LogWordcountPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [wordCount, setWordCount] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase.from('projects').select('id, title')
      setProjects(data || [])
      if (data && data.length > 0) setProjectId(data[0].id)
      setLoading(false)
    }
    loadProjects()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const wordCountNum = parseInt(wordCount)
    const today = new Date().toISOString().split('T')[0]

    const { error: snapshotError } = await supabase.from('wordcount_snapshots').insert({
      project_id: projectId,
      user_id: user.id,
      word_count: wordCountNum,
      source: 'manual',
    })

    if (snapshotError) {
      setSaving(false)
      setMessage(`Error: ${snapshotError.message}`)
      return
    }

    const { error: postError } = await supabase.from('posts').upsert(
      {
        user_id: user.id,
        project_id: projectId,
        type: 'wordcount',
        word_count: wordCountNum,
        entry_date: today,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,project_id,entry_date,type' }
    )

    setSaving(false)

    if (postError) {
      setMessage(`Snapshot saved, but post update failed: ${postError.message}`)
    } else {
      setMessage('Wordcount logged and today\'s post updated!')
      setWordCount('')
    }
  }

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  if (projects.length === 0) {
    return (
      <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
        <p style={{ color: 'var(--color-ink-muted)' }}>
          You need to create a project first before logging a wordcount.
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Log your wordcount
      </h1>
      <form onSubmit={handleSubmit} style={{ fontFamily: 'var(--font-sans)' }}>
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
        <div className="mb-6">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Current total word count</label>
          <input
            type="number"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            required
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        {message && <p className="mb-4 text-sm" style={{ color: 'var(--color-ink-muted)' }}>{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          {saving ? 'Saving...' : 'Log wordcount'}
        </button>
      </form>
    </main>
  )
}