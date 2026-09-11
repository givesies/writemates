type Snapshot = { word_count: number; recorded_at: string }

export function buildDailyCumulative(snapshots: Snapshot[]): Map<string, number> {
  const dailyMap = new Map<string, number>()
  for (const snap of snapshots) {
    const day = new Date(snap.recorded_at).toISOString().split('T')[0]
    const existing = dailyMap.get(day) || 0
    if (snap.word_count > existing) dailyMap.set(day, snap.word_count)
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

  let dayStr = cursor.toISOString().split('T')[0]
  if (!daySet.has(dayStr)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  for (let i = 0; i < 365; i++) {
    dayStr = cursor.toISOString().split('T')[0]
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
    const date = new Date(dateStr)
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
  if (!goal || currentTotal >= goal) return null

  const recentDays = Array.from(dailyDeltas.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 7)

  if (recentDays.length === 0) return null

  const avgDaily = recentDays.reduce((sum, [, words]) => sum + words, 0) / recentDays.length
  if (avgDaily <= 0) return null

  const daysRemaining = Math.ceil((goal - currentTotal) / avgDaily)
  const finishDate = new Date()
  finishDate.setDate(finishDate.getDate() + daysRemaining)

  return finishDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getAuthorTitle(totalWords: number): string {
  if (totalWords >= 500000) return 'Enid Blyton'
  if (totalWords >= 100000) return 'Agatha Christie'
  if (totalWords >= 50000) return 'Stephen King'
  if (totalWords >= 10000) return 'Hemingway'
  if (totalWords >= 1000) return 'Wordsmith'
  return 'Fledgling Scribe'
}