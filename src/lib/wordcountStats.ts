type Snapshot = { word_count: number; recorded_at: string }

// The calendar day (YYYY-MM-DD) in the user's own timezone — not UTC.
// Using UTC here filed anything logged before ~10am Sydney time under the previous day.
export function localDay(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Midnight, local time, at the start of a YYYY-MM-DD day.
export function parseLocalDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Timestamp to store for an imported/catch-up entry on a given day: local noon
// for past days, and "now" for today so that anything logged later still counts as later.
export function timestampForDay(day: string): string {
  const now = new Date()
  if (day >= localDay(now)) return now.toISOString()
  const noon = parseLocalDay(day)
  noon.setHours(12)
  return noon.toISOString()
}

// Running total per local day, in date order. The LATEST entry of a day wins
// (not the highest), so a correction can lower a total.
export function buildDailyCumulative(snapshots: Snapshot[]): Map<string, number> {
  const latest = new Map<string, { t: number; count: number }>()
  for (const snap of snapshots) {
    const t = new Date(snap.recorded_at).getTime()
    const day = localDay(snap.recorded_at)
    const existing = latest.get(day)
    if (!existing || t >= existing.t) latest.set(day, { t, count: snap.word_count })
  }
  const dailyMap = new Map<string, number>()
  for (const day of Array.from(latest.keys()).sort()) {
    dailyMap.set(day, latest.get(day)!.count)
  }
  return dailyMap
}

export function buildDailyDeltas(dailyCumulative: Map<string, number>): Map<string, number> {
  const days = Array.from(dailyCumulative.keys()).sort()
  const deltas = new Map<string, number>()
  let previous: number | null = null
  for (const day of days) {
    const total = dailyCumulative.get(day)!
    deltas.set(day, previous === null ? 0 : Math.max(0, total - previous))
    previous = total
  }
  return deltas
}

export function computeStreak(dailyCumulative: Map<string, number>): number {
  const daySet = new Set(dailyCumulative.keys())
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  let dayStr = localDay(cursor)
  if (!daySet.has(dayStr)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  for (let i = 0; i < 365; i++) {
    dayStr = localDay(cursor)
    if (daySet.has(dayStr)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function computeBestDay(dailyDeltas: Map<string, number>): { date: string; words: number } | null {
  let best: { date: string; words: number } | null = null
  for (const [date, words] of dailyDeltas.entries()) {
    if (!best || words > best.words) best = { date, words }
  }
  return best
}

export function computeWeeklyComparison(dailyDeltas: Map<string, number>): { thisWeek: number; lastWeek: number } {
  const now = new Date()
  let thisWeek = 0
  let lastWeek = 0
  for (const [dateStr, words] of dailyDeltas.entries()) {
    const date = parseLocalDay(dateStr)
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays >= 0 && diffDays < 7) thisWeek += words
    else if (diffDays >= 7 && diffDays < 14) lastWeek += words
  }
  return { thisWeek, lastWeek }
}

export function computeProjectedFinish(
  dailyDeltas: Map<string, number>,
  currentTotal: number,
  goal: number | null
): string | null {
  const details = computeProjectedFinishDetails(dailyDeltas, currentTotal, goal)
  return details.finishDateLabel
}

export function computeProjectedFinishDetails(
  dailyDeltas: Map<string, number>,
  currentTotal: number,
  goal: number | null
): {
  finishDateLabel: string | null
  daysRemaining: number | null
  writingDaysPerWeek: number
  avgPerCalendarDay: number
} {
  const allDates = Array.from(dailyDeltas.keys()).sort()

  if (allDates.length === 0 || currentTotal <= 0) {
    return { finishDateLabel: null, daysRemaining: null, writingDaysPerWeek: 0, avgPerCalendarDay: 0 }
  }

  // Simple, motivating pace: total words written over every calendar day since
  // you started, not just the days you happened to write — so any new entry
  // directly moves the average, rather than being diluted or ignored.
  const firstDate = parseLocalDay(allDates[0])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysSinceStart = Math.max(1, Math.round((today.getTime() - firstDate.getTime()) / 86400000) + 1)

  const avgPerCalendarDay = currentTotal / daysSinceStart

  const writingDays = allDates.filter((d) => (dailyDeltas.get(d) || 0) > 0)
  const writingDaysPerWeek = writingDays.length > 0
    ? Math.min(7, (writingDays.length / daysSinceStart) * 7)
    : 0
  const roundedWritingDaysPerWeek = Math.round(writingDaysPerWeek * 10) / 10

  if (!goal || currentTotal >= goal || avgPerCalendarDay <= 0) {
    return {
      finishDateLabel: null,
      daysRemaining: goal && currentTotal >= goal ? 0 : null,
      writingDaysPerWeek: roundedWritingDaysPerWeek,
      avgPerCalendarDay,
    }
  }

  const wordsRemaining = goal - currentTotal
  const daysRemaining = Math.max(1, Math.ceil(wordsRemaining / avgPerCalendarDay))

  const finishDate = new Date()
  finishDate.setDate(finishDate.getDate() + daysRemaining)

  return {
    finishDateLabel: finishDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
    daysRemaining,
    writingDaysPerWeek: roundedWritingDaysPerWeek,
    avgPerCalendarDay,
  }
}

export function getAuthorTitle(totalWords: number): string {
  if (totalWords >= 500000) return 'Enid Blyton'
  if (totalWords >= 100000) return 'Agatha Christie'
  if (totalWords >= 50000) return 'Stephen King'
  if (totalWords >= 10000) return 'Hemingway'
  if (totalWords >= 1000) return 'Wordsmith'
  return 'Fledgling Scribe'
}
