'use client'

import { Zap } from 'lucide-react'

type DayStatus = { label: string; logged: boolean; isToday: boolean }

export default function StreakStrip({ streak, days }: { streak: number; days: DayStatus[] }) {
  return (
    <div
      className="rounded-lg mb-6"
      style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.9rem 1rem' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Your streak</span>
        <div className="flex items-center gap-1">
          <Zap size={16} style={{ color: 'var(--color-accent)' }} fill="var(--color-accent)" />
          <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{streak}</span>
        </div>
      </div>
      <div className="flex justify-between">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{d.label}</span>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                backgroundColor: d.logged ? 'var(--color-accent)' : 'var(--color-paper)',
                border: d.isToday && !d.logged ? '2px solid var(--color-accent)' : '1px solid var(--color-rule)',
              }}
            >
              {d.logged && <Zap size={13} color="var(--color-paper)" fill="var(--color-paper)" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
