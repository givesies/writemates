'use client'

import { Check } from 'lucide-react'

type DayStatus = { label: string; logged: boolean; isToday: boolean }

export default function StreakStrip({ days }: { days: DayStatus[] }) {
  return (
    <div className="flex justify-between mb-4">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span
            className="text-xs"
            style={{
              fontSize: 10,
              color: d.isToday ? 'var(--color-accent)' : 'var(--color-ink-muted)',
              fontWeight: d.isToday ? 600 : 400,
              opacity: 0.8,
            }}
          >
            {d.label}
          </span>
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: 15,
              height: 15,
              backgroundColor: d.logged ? 'var(--color-ink-muted)' : 'transparent',
              border: d.logged ? 'none' : '1px solid var(--color-rule)',
              opacity: d.logged ? 0.55 : 1,
            }}
          >
            {d.logged && <Check size={8} color="var(--color-paper)" strokeWidth={3} />}
          </div>
        </div>
      ))}
    </div>
  )
}
