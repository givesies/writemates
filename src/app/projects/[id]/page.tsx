import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ProgressChart from '@/components/ProgressChart'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: snapshots } = await supabase
    .from('wordcount_snapshots')
    .select('word_count, recorded_at')
    .eq('project_id', id)
    .order('recorded_at', { ascending: true })

  const dailyMap = new Map<string, number>()
  for (const snap of snapshots || []) {
    const day = new Date(snap.recorded_at).toISOString().split('T')[0]
    const existing = dailyMap.get(day) || 0
    if (snap.word_count > existing) dailyMap.set(day, snap.word_count)
  }

  const chartData = Array.from(dailyMap.entries()).map(([date, wordCount]) => ({
    date,
    wordCount,
  }))

  const currentWordCount = chartData.length > 0 ? chartData[chartData.length - 1].wordCount : 0
  const percentComplete = project.goal_word_count
    ? Math.min(100, Math.round((currentWordCount / project.goal_word_count) * 100))
    : null

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        {project.title}
      </h1>
      <p className="mb-8" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
        {currentWordCount.toLocaleString()} words
        {percentComplete !== null && (
          <> — <span style={{ color: 'var(--color-accent)' }}>{percentComplete}%</span> of {project.goal_word_count?.toLocaleString()} word goal</>
        )}
      </p>

      {chartData.length > 1 ? (
        <ProgressChart data={chartData} />
      ) : (
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          Log a few more wordcounts (ideally on different days) to see your progress graph.
        </p>
      )}
    </main>
  )
}