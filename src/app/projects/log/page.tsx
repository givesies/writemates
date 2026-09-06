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

    const { error } = await supabase.from('wordcount_snapshots').insert({
      project_id: projectId,
      user_id: user.id,
      word_count: parseInt(wordCount),
      source: 'manual',
    })

    setSaving(false)

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Wordcount logged!')
      setWordCount('')
    }
  }

  if (loading) return <main style={{ padding: '2rem' }}>Loading...</main>

  if (projects.length === 0) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <p>You need to create a project first before logging a wordcount.</p>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h1>Log your wordcount</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Project</label><br />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Current total word count</label><br />
          <input
            type="number"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {message && <p>{message}</p>}
        <button type="submit" disabled={saving} style={{ padding: '0.5rem 1rem' }}>
          {saving ? 'Saving...' : 'Log wordcount'}
        </button>
      </form>
    </main>
  )
}
