'use client'

import { createClient } from '@/lib/supabase/client'
import { useIsNativeApp } from '@/lib/native'

// Inside the iOS app, Google's sign-in page opens in Safari instead of the app,
// so the session never reaches the app. Hide the button there until
// Sign in with Apple / native Google sign-in is added. The website is unaffected.
export default function GoogleSignInButton() {
  const hidden = useIsNativeApp()

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (hidden) return null

  return (
    <>
      <button
        onClick={handleGoogleSignIn}
        type="button"
        className="w-full py-2.5 text-sm rounded-lg flex items-center justify-center gap-2 mb-5"
        style={{ border: '1px solid var(--color-rule)', backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
      >
        <span style={{ fontWeight: 700, color: '#4285F4' }}>G</span>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-rule)' }} />
        <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>or</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-rule)' }} />
      </div>
    </>
  )
}
