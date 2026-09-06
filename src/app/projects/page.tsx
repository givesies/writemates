'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Project = {
  id: string
  title: string
  goal_word_count: number | null
  status: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState('')
  const [goalWordCount, setGoalWordCount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function loadProjects() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    setProjects(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('projects').insert({
      user_id: user.id,
      title,
      goal_word_count: goalWordCount ? parseInt(goalWordCount) : null,
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setGoalWordCount('')
      loadProjects()
    }
  }

  if (loading) return <main style={{ padding: '2rem' }}>Loading...</main>

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>Your projects</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Project title</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Goal word count (optional)</label><br />
          <input
            type="number"
            value={goalWordCount}
            onChange={(e) => setGoalWordCount(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Create project</button>
      </form>

      <h2>Existing projects</h2>
      {projects.length === 0 && <p>No projects yet — create one above.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map((project) => (
          <li
            key={project.id}
            style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '0.75rem' }}
          >
            <strong>{project.title}</strong>
            {project.goal_word_count && <span> — goal: {project.goal_word_count.toLocaleString()} words</span>}
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Status: {project.status}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
