'use client'

import { useRouter } from 'next/navigation'

export default function OnboardingWelcomePage() {
  const router = useRouter()

  return (
    <main className="max-w-md mx-auto px-6 py-20 text-center" style={{ fontFamily: 'var(--font-sans)' }}>
      <h1 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Welcome to Writemates
      </h1>
      <p className="mb-10" style={{ color: 'var(--color-ink-muted)' }}>
        Want to add your current project, so we can start tracking your progress?
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push('/onboarding/new-project')}
          className="px-5 py-3 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Yes, let&apos;s do it
        </button>
        <button
          onClick={() => router.push('/feed')}
          className="px-5 py-3 text-sm"
          style={{ backgroundColor: 'transparent', color: 'var(--color-ink-muted)', border: '1px solid var(--color-rule)' }}
        >
          Maybe later
        </button>
      </div>
    </main>
  )
}
