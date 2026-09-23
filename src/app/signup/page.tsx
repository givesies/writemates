'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/onboarding')
      router.refresh()
    }
  }

  return (
    <main
      className="flex flex-col items-center justify-center px-6"
      style={{ minHeight: '100vh' }}
    >
      <div className="text-center mb-10">
        <h1
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '2.25rem', color: 'var(--color-accent)' }}
        >
          Writemates
        </h1>
        <p className="mt-1" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-ink-muted)' }}>
          Where Writers Grow Together
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-xl"
        style={{ border: '1px solid var(--color-rule)', backgroundColor: 'var(--color-paper)', padding: '2rem' }}
      >
        <h2 className="text-xl mb-6" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
          Sign up
        </h2>
        <form onSubmit={handleSignUp} style={{ fontFamily: 'var(--font-sans)' }}>
          <div className="mb-5">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
          {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 text-sm rounded-lg"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)' }}
          >
            Sign up
          </button>
        </form>
        <p className="mt-6 text-sm text-center" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--color-accent)' }}>Log in</a>
        </p>
      </div>
    </main>
  )
}
