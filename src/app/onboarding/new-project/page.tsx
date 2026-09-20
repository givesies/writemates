'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

export default function OnboardingNewProjectPage() {
  const [title, setTitle] = useState('')
  const [projectType, setProjectType] = useState('book')
  const [draftStage, setDraftStage] = useState('first_draft')
  const [metricUnit, setMetricUnit] = useState('words')
  const [goalWordCount, setGoalWordCount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleStageChange(value: string) {
    setDraftStage(value)
    const stage = DRAFT_STAGES.find((s) => s.value === value)
    if (stage) setMetricUnit(stage.defaultUnit)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title,
        project_type: projectType,
        draft_stage: draftStage,
        metric_unit: metricUnit,
        goal_word_count: goalWordCount ? parseInt(goalWordCount) : null,
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message)
    } else if (data) {
      router.push(`/projects/${data.id}/backfill`)
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
      <h1 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Tell us about your project
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-ink-muted)' }}>
        You can always add more projects later.
      </p>

      <form onSubmit={handleCreate}>
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

        <div className="mb-6">
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
          disabled={saving}
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          {saving ? 'Creating...' : 'Continue'}
        </button>
      </form>
    </main>
  )
}
