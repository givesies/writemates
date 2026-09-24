'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg"
      style={{ border: '1px solid var(--color-rule)', color: 'var(--color-ink-muted)' }}
    >
      <LogOut size={16} />
      Log out
    </button>
  )
}
