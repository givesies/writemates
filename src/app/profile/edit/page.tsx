'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditProfilePage() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [currentWork, setCurrentWork] = useState('')
  const [genresWrite, setGenresWrite] = useState('')
  const [genresRead, setGenresRead] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
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
        setGenresWrite(profile.genres_write || '')
        setGenresRead(profile.genres_read || '')
        setAvatarUrl(profile.avatar_url || null)
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

    let newAvatarUrl = avatarUrl

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        setSaving(false)
        setError(`Upload failed: ${uploadError.message}`)
        return
      }

      const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(filePath)
      newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
        current_work_description: currentWork,
        genres_write: genresWrite,
        genres_read: genresRead,
        avatar_url: newAvatarUrl,
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

  if (loading) return <main className="max-w-md mx-auto px-6 py-16">Loading...</main>

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Edit your profile
      </h1>
      <form onSubmit={handleSave} style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="mb-6">
          <label className="block text-sm mb-2" style={{ color: 'var(--color-ink-muted)' }}>Profile photo</label>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              className="w-20 h-20 rounded-full object-cover mb-3"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>What I&apos;ve been working on</label>
          <textarea
            value={currentWork}
            onChange={(e) => setCurrentWork(e.target.value)}
            rows={4}
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Genres I write in</label>
          <input
            type="text"
            value={genresWrite}
            onChange={(e) => setGenresWrite(e.target.value)}
            placeholder="e.g. literary fiction, sci-fi"
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Favorite genres to read</label>
          <input
            type="text"
            value={genresRead}
            onChange={(e) => setGenresRead(e.target.value)}
            placeholder="e.g. mystery, fantasy"
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </main>
  )
}