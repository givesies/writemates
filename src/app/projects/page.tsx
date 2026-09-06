'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

  if (loading) return <main className="max-w-2xl mx-auto px-6 py-12">Loading...</main>

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-10" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Your projects
      </h1>

      <form onSubmit={handleCreate} className="mb-12 pb-10 border-b" style={{ borderColor: 'var(--color-rule)', fontFamily: 'var(--font-sans)' }}>
        <div className="mb-4">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Project title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Goal word count (optional)</label>
          <input
            type="number"
            value={goalWordCount}
            onChange={(e) => setGoalWordCount(e.target.value)}
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
        <button
          type="submit"
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Create project
        </button>
      </form>

      {projects.length === 0 && (
        <p style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
          No projects yet — create one above.
        </p>
      )}

      <div>
        {projects.map((project) => (
          <div key={project.id} className="py-5 border-b" style={{ borderColor: 'var(--color-rule)' }}>
            <Link href={`/projects/${project.id}`} className="text-lg">
              {project.title}
            </Link>
            {project.goal_word_count && (
              <span className="text-sm ml-2" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                goal: {project.goal_word_count.toLocaleString()} words
              </span>
            )}
            <div className="text-sm mt-1" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
              {project.status}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}