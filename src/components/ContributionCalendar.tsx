'use client'

export default function ContributionCalendar({
  dailyDeltas,
}: {
  dailyDeltas: Record<string, number>
}) {
  const days: { date: string; words: number }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({ date: dateStr, words: dailyDeltas[dateStr] || 0 })
  }

  function intensity(words: number): string {
    if (words === 0) return 'var(--color-rule)'
    if (words < 200) return '#c5d4c9'
    if (words < 500) return '#8fac97'
    if (words < 1000) return '#5a7d65'
    return 'var(--color-accent)'
  }

  const weeks: { date: string; words: number }[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="flex gap-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.words.toLocaleString()} words`}
              style={{
                width: 10,
                height: 10,
                backgroundColor: intensity(day.words),
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}