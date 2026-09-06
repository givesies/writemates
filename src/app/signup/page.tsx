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
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Sign up
      </h1>
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
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Sign up
        </button>
      </form>
      <p className="mt-6 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </main>
  )
}