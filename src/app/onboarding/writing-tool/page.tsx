'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TOOLS = [
  { value: 'scrivener', label: 'Scrivener' },
  { value: 'google_docs', label: 'Google Docs' },
  { value: 'word', label: 'Microsoft Word' },
  { value: 'final_draft', label: 'Final Draft (screenplays)' },
  { value: 'other', label: 'Something else' },
]

export default function WritingToolPage() {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function choose(tool: string) {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ writing_tool: tool }).eq('id', user.id)
    }
    router.push(`/onboarding/new-project?tool=${tool}`)
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16" style={{ fontFamily: 'var(--font-sans)' }}>
      <h1 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        What do you write with?
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-ink-muted)' }}>
        This helps us tailor how you log your progress.
      </p>

      <div className="flex flex-col gap-3">
        {TOOLS.map((t) => (
          <button
            key={t.value}
            onClick={() => choose(t.value)}
            disabled={saving}
            className="text-left px-4 py-3 rounded-lg text-sm"
            style={{ border: '1px solid var(--color-rule)', backgroundColor: 'var(--color-paper)' }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </main>
  )
}
