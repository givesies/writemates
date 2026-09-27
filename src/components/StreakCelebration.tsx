'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

function getMilestoneMessage(streak: number): string | null {
  if (streak === 1) return "New streak started! Keep it going."
  const milestones = [3, 5, 7, 10, 14, 21, 30, 50, 75, 100]
  if (milestones.includes(streak)) return `${streak} day streak! You're on fire.`
  if (streak > 100 && streak % 50 === 0) return `${streak} day streak! Incredible consistency.`
  return null
}

export default function StreakCelebration({ streak, projectId }: { streak: number; projectId: string }) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (streak <= 0) return
    const msg = getMilestoneMessage(streak)
    if (!msg) return

    const today = new Date().toISOString().split('T')[0]
    const key = `wm_streak_seen_${projectId}_${today}_${streak}`
    if (localStorage.getItem(key)) return

    setMessage(msg)
    localStorage.setItem(key, '1')
  }, [streak, projectId])

  if (!message) return null

  return (
    <div
      onClick={() => setMessage(null)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-paper)',
          borderRadius: 16,
          padding: '2rem',
          maxWidth: 300,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--color-paper-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <Zap size={28} color="var(--color-accent)" fill="var(--color-accent)" />
        </div>
        <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
          {message}
        </p>
        <button
          onClick={() => setMessage(null)}
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)', padding: '0.6rem 1.5rem', borderRadius: 8, fontSize: '0.9rem' }}
        >
          Nice!
        </button>
      </div>
    </div>
  )
}
