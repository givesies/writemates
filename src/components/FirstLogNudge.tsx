'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function FirstLogNudge({ unit }: { unit: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const alreadyShown = localStorage.getItem('wm_first_log_nudge_shown')
    if (alreadyShown) return
    setVisible(true)
    localStorage.setItem('wm_first_log_nudge_shown', '1')
  }, [])

  if (!visible) return null

  return (
    <div
      onClick={() => setVisible(false)}
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
          <Sparkles size={26} color="var(--color-accent)" />
        </div>
        <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          The magic starts when you log your first {unit} count
        </p>
        <p className="text-sm mb-5" style={{ color: 'var(--color-ink-muted)' }}>
          Tap the + below to get started.
        </p>
        <button
          onClick={() => setVisible(false)}
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)', padding: '0.6rem 1.5rem', borderRadius: 8, fontSize: '0.9rem' }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
