import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ProgressChart from '@/components/ProgressChart'
import ContributionCalendar from '@/components/ContributionCalendar'
import {
  buildDailyCumulative,
  buildDailyDeltas,
  computeStreak,
  computeBestDay,
  computeWeeklyComparison,
  computeProjectedFinish,
} from '@/lib/wordcountStats'

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

  const dailyMap = buildDailyCumulative(snapshots || [])
  const dailyDeltas = buildDailyDeltas(dailyMap)

  const chartData = Array.from(dailyMap.entries()).map(([date, wordCount]) => ({
    date,
    wordCount,
  }))

  const currentWordCount = chartData.length > 0 ? chartData[chartData.length - 1].wordCount : 0
  const percentComplete = project.goal_word_count
    ? Math.min(100, Math.round((currentWordCount / project.goal_word_count) * 100))
    : null

  const streak = computeStreak(dailyMap)
  const bestDay = computeBestDay(dailyDeltas)
  const { thisWeek, lastWeek } = computeWeeklyComparison(dailyDeltas)
  const projectedFinish = computeProjectedFinish(dailyDeltas, currentWordCount, project.goal_word_count)
  const dailyDeltasObj = Object.fromEntries(dailyDeltas)

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

      <div
        className="flex flex-wrap gap-x-8 gap-y-2 mb-8 text-sm"
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
      >
        {streak > 0 && (
          <span>
            <strong style={{ color: 'var(--color-accent)' }}>{streak}</strong> day streak
          </span>
        )}
        {bestDay && bestDay.words > 0 && (
          <span>
            Best day: <strong style={{ color: 'var(--color-ink)' }}>{bestDay.words.toLocaleString()}</strong> words on{' '}
            {new Date(bestDay.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
        {(thisWeek > 0 || lastWeek > 0) && (
          <span>
            This week: <strong style={{ color: 'var(--color-ink)' }}>{thisWeek.toLocaleString()}</strong>
            {' '}(last week: {lastWeek.toLocaleString()})
          </span>
        )}
        {projectedFinish && (
          <span>
            Projected finish: <strong style={{ color: 'var(--color-ink)' }}>{projectedFinish}</strong>
          </span>
        )}
      </div>

      {chartData.length > 1 ? (
        <ProgressChart data={chartData} />
      ) : (
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          Log a few more wordcounts (ideally on different days) to see your progress graph.
        </p>
      )}

      <div className="mt-10">
        <h2
          className="text-sm mb-3"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
        >
          Last 90 days
        </h2>
        <ContributionCalendar dailyDeltas={dailyDeltasObj} />
      </div>
    </main>
  )
}