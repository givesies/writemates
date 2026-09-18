'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { buildDailyCumulative } from '@/lib/wordcountStats'

type Project = {
  id: string
  title: string
  goal_word_count: number | null
  status: string
  project_type: string
  draft_stage: string
  metric_unit: string
}

const PROJECT_TYPES = [
  { value: 'book', label: 'Book' },
  { value: 'screenplay', label: 'Screenplay' },
  { value: 'article', label: 'Article' },
  { value: 'short_story', label: 'Short story' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'other', label: 'Other' },
]

const DRAFT_STAGES = [
  { value: 'first_draft', label: 'First draft', defaultUnit: 'words' },
  { value: 'editing', label: 'Editing', defaultUnit: 'pages' },
  { value: 'revision_2', label: 'Second revision', defaultUnit: 'pages' },
  { value: 'revision_3_plus', label: 'Third revision or later', defaultUnit: 'pages' },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState('')
  const [goalWordCount, setGoalWordCount] = useState('')
  const [projectType, setProjectType] = useState('book')
  const [draftStage, setDraftStage] = useState('first_draft')
  const [metricUnit, setMetricUnit] = useState('words')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalWords, setTotalWords] = useState(0)
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

    const { data: allSnapshots } = await supabase
      .from('wordcount_snapshots')
      .select('word_count, recorded_at, project_id')
      .eq('user_id', user.id)

    const byProject = new Map<string, typeof allSnapshots>()
    for (const snap of allSnapshots || []) {
      const list = byProject.get(snap.project_id) || []
      list.push(snap)
      byProject.set(snap.project_id, list)
    }
    let total = 0
    for (const snaps of byProject.values()) {
      const daily = buildDailyCumulative(snaps!)
      const values = Array.from(daily.values())
      if (values.length > 0) total += Math.max(...values)
    }
    setTotalWords(total)

    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  function handleStageChange(value: string) {
    setDraftStage(value)
    const stage = DRAFT_STAGES.find((s) => s.value === value)
    if (stage) setMetricUnit(stage.defaultUnit)
  }

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
      project_type: projectType,
      draft_stage: draftStage,
      metric_unit: metricUnit,
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setGoalWordCount('')
      setProjectType('book')
      setDraftStage('first_draft')
      setMetricUnit('words')
      loadProjects()
    }
  }

  if (loading) return <main className="max-w-2xl mx-auto px-6 py-12">Loading...</main>

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Your projects
      </h1>
      {totalWords > 0 && (
        <p className="mb-10" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          <strong style={{ color: 'var(--color-accent)' }}>{totalWords.toLocaleString()}</strong> words written across all projects
        </p>
      )}

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

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Project type</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Stage</label>
            <select
              value={draftStage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            >
              {DRAFT_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
            Tracking unit
          </label>
          <select
            value={metricUnit}
            onChange={(e) => setMetricUnit(e.target.value)}
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          >
            <option value="words">Words</option>
            <option value="pages">Pages</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
            Goal ({metricUnit === 'words' ? 'word count' : 'page count'}, optional)
          </label>
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
                goal: {project.goal_word_count.toLocaleString()} {project.metric_unit || 'words'}
              </span>
            )}
            <div className="text-sm mt-1" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
              {(PROJECT_TYPES.find((t) => t.value === project.project_type)?.label) || 'Book'}
              {' · '}
              {(DRAFT_STAGES.find((s) => s.value === project.draft_stage)?.label) || 'First draft'}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}