'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditProfilePage() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [currentWork, setCurrentWork] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name || '')
        setBio(profile.bio || '')
        setCurrentWork(profile.current_work_description || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
        current_work_description: currentWork,
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  if (loading) return <main style={{ padding: '2rem' }}>Loading...</main>

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h1>Edit your profile</h1>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Display name</label><br />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Bio</label><br />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>What I&apos;ve been working on</label><br />
          <textarea
            value={currentWork}
            onChange={(e) => setCurrentWork(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={saving} style={{ padding: '0.5rem 1rem' }}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </main>
  )
}
