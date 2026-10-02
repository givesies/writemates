'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { buildDailyCumulative, buildDailyDeltas, computeProjectedFinishDetails, parseLocalDay } from '@/lib/wordcountStats'

const METRIC_CONFIG: Record<string, { title: string; goodWhenLow: boolean }> = {
  completion: { title: 'Time to completion', goodWhenLow: true },
  today: { title: 'Daily word count', goodWhenLow: false },
  week: { title: 'Weekly total', goodWhenLow: false },
  average: { title: 'Daily average', goodWhenLow: false },
}

export default function StatDetailPage({
  params,
}: {
  params: Promise<{ id: string; metric: string }>
}) {
  const { id, metric } = use(params)
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState<{ date: string; value: number; label: string }[]>([])
  const [unit, setUnit] = useState('words')
  const [projectTitle, setProjectTitle] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: project } = await supabase
        .from('projects')
        .select('title, goal_word_count, metric_unit')
        .eq('id', id)
        .single()

      if (project) {
        setUnit(project.metric_unit || 'words')
        setProjectTitle(project.title)
      }

      const { data: snapshots } = await supabase
        .from('wordcount_snapshots')
        .select('word_count, recorded_at')
        .eq('project_id', id)
        .order('recorded_at', { ascending: true })

      const dailyMap = buildDailyCumulative(snapshots || [])
      const dailyDeltas = buildDailyDeltas(dailyMap)
      const dates = Array.from(dailyMap.keys()).sort()

      const result: { date: string; value: number; label: string }[] = []

      for (const d of dates) {
        const label = parseLocalDay(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

        if (metric === 'today') {
          result.push({ date: d, value: dailyDeltas.get(d) || 0, label })
          continue
        }

        if (metric === 'week') {
          const dObj = parseLocalDay(d)
          let sum = 0
          for (const [dateStr, words] of dailyDeltas.entries()) {
            const diffDays = Math.floor((dObj.getTime() - parseLocalDay(dateStr).getTime()) / 86400000)
            if (diffDays >= 0 && diffDays < 7) sum += words
          }
          result.push({ date: d, value: sum, label })
          continue
        }

        const dailyMapUpToD = new Map<string, number>()
        for (const [dateStr, total] of dailyMap.entries()) {
          if (dateStr <= d) dailyMapUpToD.set(dateStr, total)
        }
        const deltasUpToD = buildDailyDeltas(dailyMapUpToD)
        const totalAsOfD = dailyMapUpToD.get(d) || 0
        const details = computeProjectedFinishDetails(deltasUpToD, totalAsOfD, project?.goal_word_count ?? null)

        if (metric === 'completion') {
          if (details.daysRemaining !== null) {
            result.push({ date: d, value: details.daysRemaining, label })
          }
        } else if (metric === 'average') {
          result.push({ date: d, value: Math.round(details.avgPerCalendarDay), label })
        }
      }

      setSeries(result)
      setLoading(false)
    }
    load()
  }, [id, metric, router])

  const config = METRIC_CONFIG[metric] || METRIC_CONFIG.today
  const latest = series.length > 0 ? series[series.length - 1].value : null
  const earliest = series.length > 0 ? series[0].value : null
  const change = latest !== null && earliest !== null ? latest - earliest : null
  const isGoodChange = change !== null && (config.goodWhenLow ? change < 0 : change > 0)

  return (
    <main className="max-w-2xl mx-auto px-6 py-10" style={{ fontFamily: 'var(--font-sans)' }}>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm mb-6"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
        <span className="text-xs" style={{ color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.03em' }}>
          INSIGHTS
        </span>
      </div>

      <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        {config.title}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-muted)' }}>
        {projectTitle}
      </p>

      {loading ? (
        <p style={{ color: 'var(--color-ink-muted)' }}>Loading...</p>
      ) : series.length < 2 ? (
        <p style={{ color: 'var(--color-ink-muted)' }}>
          Log a few more days to see how this trends over time.
        </p>
      ) : (
        <>
          <div
            className="rounded-lg p-5 mb-6"
            style={{ backgroundColor: 'var(--color-paper-raised)' }}
          >
            <p className="text-3xl mb-1" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              {latest?.toLocaleString()} {metric === 'completion' ? 'days' : unit}
            </p>
            {change !== null && change !== 0 && (
              <p
                className="text-sm"
                style={{ color: isGoodChange ? '#16a34a' : 'var(--color-ink-muted)', fontWeight: isGoodChange ? 700 : 400 }}
              >
                {change > 0 ? '+' : ''}{change.toLocaleString()} since {series[0].label}
              </p>
            )}
          </div>

          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-rule)', height: 280 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }} width={40} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-rule)' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </main>
  )
}
