'use client'

import { createClient } from '@/lib/supabase/client'

export default function GoogleSignInButton() {
  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      type="button"
      className="w-full py-2.5 text-sm rounded-lg flex items-center justify-center gap-2 mb-5"
      style={{ border: '1px solid var(--color-rule)', backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
    >
      <span style={{ fontWeight: 700, color: '#4285F4' }}>G</span>
      Continue with Google
    </button>
  )
}
