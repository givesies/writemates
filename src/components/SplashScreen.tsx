'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('wm_splash_shown')
    if (alreadyShown) return

    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('wm_splash_shown', '1')
    }, 900)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100dvh',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-paper)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 600,
          fontSize: '2.5rem',
          color: 'var(--color-accent)',
          marginBottom: '0.5rem',
        }}
      >
        Writemates
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.95rem',
          color: 'var(--color-ink-muted)',
        }}
      >
        A Place For Writers
      </p>
    </div>
  )
}
