'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown } from 'lucide-react'
import {
  buildDailyCumulative,
  buildDailyDeltas,
  computeProjectedFinishDetails,
  computeStreak,
} from '@/lib/wordcountStats'
import { computeInsight, type Insight } from '@/lib/insights'
import WeeklyChart from '@/components/WeeklyChart'
import StreakStrip from '@/components/StreakStrip'
import StreakCelebration from '@/components/StreakCelebration'
import FirstLogNudge from '@/components/FirstLogNudge'
import { playSuccessChime } from '@/lib/sounds'

type Project = {
  id: string
  title: string
  project_type: string
  draft_stage: string
  metric_unit: string
  goal_word_count: number | null
  created_at: string
}

const DRAFT_STAGE_LABELS: Record<string, string> = {
  first_draft: 'first draft',
  editing: 'edit',
  revision_2: 'second revision',
  revision_3_plus: 'revision',
}

function Delta({
  value,
  upLabel,
  downLabel,
  goodWhen,
  invertArrow,
}: {
  value: number
  upLabel: string
  downLabel: string
  goodWhen: 'up' | 'down'
  invertArrow?: boolean
}) {
  const isUp = value > 0
  const isGood = value !== 0 && (goodWhen === 'up' ? isUp : !isUp)
  const showDownArrow = invertArrow ? isUp : !isUp

  useEffect(() => {
    if (value === 0 || !isGood) return
    const key = `wm_chime_${upLabel}_${value}`
    if (!sessionStorage.getItem(key)) {
      playSuccessChime()
      sessionStorage.setItem(key, '1')
    }
  }, [])

  if (value === 0) return null
  const color = isGood ? '#16a34a' : 'var(--color-ink-muted)'
  const iconSize = isGood ? 14 : 10
  const strokeWidth = isGood ? 3 : 1.5
  return (
    <div
      className="flex items-center gap-1 mt-1"
      style={{ fontSize: isGood ? 12 : 10, color, fontWeight: isGood ? 600 : 400 }}
    >
      {showDownArrow ? (
        <ArrowDown size={iconSize} strokeWidth={strokeWidth} />
      ) : (
        <ArrowUp size={iconSize} strokeWidth={strokeWidth} />
      )}
      <span>{Math.abs(value).toLocaleString()} {isUp ? upLabel : downLabel}</span>
    </div>
  )
}

export default function TodayPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedId, setSelectedIdState] = useState<string | null>(null)
  function setSelectedId(id: string | null) {
    setSelectedIdState(id)
    if (id) localStorage.setItem('wm_current_project', id)
  }
  const [loading, setLoading] = useState(true)

  const [currentTotal, setCurrentTotal] = useState(0)
  const [percent, setPercent] = useState<number | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [todayDelta, setTodayDelta] = useState(0)
  const [weekCount, setWeekCount] = useState(0)
  const [weekDelta, setWeekDelta] = useState(0)
  const [avgPerDay, setAvgPerDay] = useState(0)
  const [avgDelta, setAvgDelta] = useState(0)
  const [finishDateLabel, setFinishDateLabel] = useState<string | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [daysRemainingDelta, setDaysRemainingDelta] = useState(0)
  const [writingDaysPerWeek, setWritingDaysPerWeek] = useState(0)
  const [daysSinceStart, setDaysSinceStart] = useState(0)
  const [chartData, setChartData] = useState<{ day: string; words: number }[]>([])
  const [chartAverage, setChartAverage] = useState(0)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [streak, setStreak] = useState(0)
  const [streakDays, setStreakDays] = useState<{ label: string; logged: boolean; isToday: boolean }[]>([])

  const router = useRouter()

  useEffect(() => {
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
      if (data && data.length > 0) setSelectedId(data[0].id)
      setLoading(false)
    }
    loadProjects()
  }, [router])

  useEffect(() => {
    if (!selectedId) return

    async function loadStats() {
      const supabase = createClient()
      const project = projects.find((p) => p.id === selectedId)
      if (!project) return

      const { data: snapshots } = await supabase
        .from('wordcount_snapshots')
        .select('word_count, recorded_at')
        .eq('project_id', selectedId)
        .order('recorded_at', { ascending: true })

      const dailyMap = buildDailyCumulative(snapshots || [])
      const dailyDeltas = buildDailyDeltas(dailyMap)

      const values = Array.from(dailyMap.values())
      const total = values.length > 0 ? values[values.length - 1] : 0
      setCurrentTotal(total)
      setPercent(project.goal_word_count ? Math.min(100, Math.round((total / project.goal_word_count) * 100)) : null)

      const todayStr = new Date().toISOString().split('T')[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const todayWords = dailyDeltas.get(todayStr) || 0
      const yesterdayWords = dailyDeltas.get(yesterdayStr) || 0
      setTodayCount(todayWords)
      setTodayDelta(todayWords - yesterdayWords)

      const now = new Date()
      let week = 0
      let lastWeek = 0
      for (const [dateStr, words] of dailyDeltas.entries()) {
        const diffDays = Math.floor((now.getTime() - new Date(dateStr).getTime()) / 86400000)
        if (diffDays >= 0 && diffDays < 7) week += words
        else if (diffDays >= 7 && diffDays < 14) lastWeek += words
      }
      setWeekCount(week)
      setWeekDelta(week - lastWeek)

      const details = computeProjectedFinishDetails(dailyDeltas, total, project.goal_word_count)
      setFinishDateLabel(details.finishDateLabel)
      setDaysRemaining(details.daysRemaining)
      setWritingDaysPerWeek(details.writingDaysPerWeek)
      setAvgPerDay(details.avgPerCalendarDay)

      const dailyMapExclToday = new Map(dailyMap)
      dailyMapExclToday.delete(todayStr)
      const dailyDeltasExclToday = buildDailyDeltas(dailyMapExclToday)
      const valuesExcl = Array.from(dailyMapExclToday.values())
      const totalExcl = valuesExcl.length > 0 ? valuesExcl[valuesExcl.length - 1] : 0
      const detailsExcl = computeProjectedFinishDetails(dailyDeltasExclToday, totalExcl, project.goal_word_count)

      if (details.daysRemaining !== null && detailsExcl.daysRemaining !== null) {
        setDaysRemainingDelta(detailsExcl.daysRemaining - details.daysRemaining)
      } else {
        setDaysRemainingDelta(0)
      }
      setAvgDelta(Math.round(details.avgPerCalendarDay - detailsExcl.avgPerCalendarDay))

      const created = new Date(project.created_at)
      const snapshotDates = Array.from(dailyMap.keys()).sort()
      const earliestSnapshotDate = snapshotDates.length > 0 ? new Date(snapshotDates[0]) : null
      const startDate = earliestSnapshotDate && earliestSnapshotDate < created ? earliestSnapshotDate : created
      setDaysSinceStart(Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / 86400000) + 1))

      const days: { day: string; words: number }[] = []
      const streakStripDays: { label: string; logged: boolean; isToday: boolean }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const label = d.toLocaleDateString(undefined, { weekday: 'short' })
        const words = dailyDeltas.get(dateStr) || 0
        days.push({ day: label, words })
        streakStripDays.push({ label: label.charAt(0), logged: words > 0, isToday: i === 0 })
      }
      setChartData(days)
      setChartAverage(days.reduce((sum, d) => sum + d.words, 0) / 7)
      setStreakDays(streakStripDays)
      setStreak(computeStreak(dailyMap))

      setInsight(computeInsight(details.avgPerCalendarDay, details.daysRemaining))
    }
    loadStats()
  }, [selectedId, projects])

  if (loading) return <main className="max-w-2xl mx-auto px-6 py-12">Loading...</main>

  if (projects.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12" style={{ fontFamily: 'var(--font-sans)' }}>
        <h1 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
          Today
        </h1>
        <p style={{ color: 'var(--color-ink-muted)' }}>
          Create your first project using the + button below to see your progress here.
        </p>
      </main>
    )
  }

  const project = projects.find((p) => p.id === selectedId)
  const unit = project?.metric_unit || 'words'
  const stageLabel = DRAFT_STAGE_LABELS[project?.draft_stage || 'first_draft'] || 'draft'

  return (
    <main className="max-w-2xl mx-auto px-6 py-12" style={{ fontFamily: 'var(--font-sans)' }}>
      {selectedId && <StreakCelebration streak={streak} projectId={selectedId} />}
      {!loading && currentTotal === 0 && <FirstLogNudge unit={unit} />}

      {projects.length > 1 && (
        <select
          value={selectedId || ''}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mb-4 text-sm bg-transparent border-b py-1 focus:outline-none"
          style={{ borderColor: 'var(--color-rule)', color: 'var(--color-ink-muted)' }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      )}

      <StreakStrip days={streakDays} />

      {project?.goal_word_count && (
        <p className="text-sm mb-6" style={{ color: 'var(--color-ink-muted)' }}>
          <strong style={{ color: 'var(--color-ink)' }}>{currentTotal.toLocaleString()}</strong>
          {' / '}
          {project.goal_word_count.toLocaleString()} {unit}
          {percent !== null && (
            <> — <span style={{ color: 'var(--color-accent)' }}>{percent}%</span></>
          )}
        </p>
      )}

      <div
        className="rounded-lg mb-6"
        style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.9rem 1rem' }}
      >
        {finishDateLabel ? (
          <>
            <p className="text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
              Keep it up. Your projected finish date for your {stageLabel} of {project?.title} is
            </p>
            <p className="text-xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-accent)' }}>
              {finishDateLabel}
            </p>
            <Delta value={daysRemainingDelta} upLabel="days closer" downLabel="days further" goodWhen="up" invertArrow />
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            Log a few {unit} to see your projected finish date.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg" style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.75rem' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-ink-muted)' }}>Time to completion</p>
          <p className="text-xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            {daysRemaining !== null ? `${daysRemaining} days` : '—'}
          </p>
          <Delta value={daysRemainingDelta} upLabel="days closer" downLabel="days further" goodWhen="up" invertArrow />
        </div>
        <div className="rounded-lg" style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.75rem' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-ink-muted)' }}>Today</p>
          <p className="text-xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            {todayCount.toLocaleString()} {unit}
          </p>
          <Delta value={todayDelta} upLabel="more than yesterday" downLabel="fewer than yesterday" goodWhen="up" />
        </div>
        <div className="rounded-lg" style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.75rem' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-ink-muted)' }}>This week</p>
          <p className="text-xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            {weekCount.toLocaleString()} {unit}
          </p>
          <Delta value={weekDelta} upLabel="more than last week" downLabel="less than last week" goodWhen="up" />
        </div>
        <div className="rounded-lg" style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.75rem' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-ink-muted)' }}>Daily average</p>
          <p className="text-xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            {Math.round(avgPerDay).toLocaleString()} {unit}
          </p>
          <Delta value={avgDelta} upLabel="higher since today" downLabel="lower since today" goodWhen="up" />
        </div>
      </div>

      {chartData.some((d) => d.words > 0) && (
        <div className="mb-6">
          <WeeklyChart data={chartData} average={chartAverage} />
        </div>
      )}

      <p className="text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>
        You&apos;ve been working on {project?.title} for {daysSinceStart} day{daysSinceStart === 1 ? '' : 's'}.
      </p>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-muted)' }}>
        You write {writingDaysPerWeek > 0 ? writingDaysPerWeek : 0} day{writingDaysPerWeek === 1 ? '' : 's'} a week on average.
      </p>

      {insight && (
        <div
          className="rounded-lg flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.9rem 1rem' }}
        >
          <div className="flex-1">
            <p className="text-sm mb-1" style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{insight.title}</p>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{insight.body}</p>
          </div>
        </div>
      )}
    </main>
  )
}
