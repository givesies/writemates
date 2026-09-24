'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

type WorkLink = { label: string; url: string }

export default function EditProfilePage() {
  const [displayName, setDisplayName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [occupation, setOccupation] = useState('')
  const [bookTitle, setBookTitle] = useState('')
  const [workLinks, setWorkLinks] = useState<WorkLink[]>([])
  const [bio, setBio] = useState('')
  const [currentWork, setCurrentWork] = useState('')
  const [genresWrite, setGenresWrite] = useState('')
  const [genresRead, setGenresRead] = useState('')
  const [substackUrl, setSubstackUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
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
        setFirstName(profile.first_name || '')
        setLastName(profile.last_name || '')
        setOccupation(profile.occupation || '')
        setBookTitle(profile.book_title || '')
        setWorkLinks(Array.isArray(profile.work_links) ? profile.work_links : [])
        setBio(profile.bio || '')
        setCurrentWork(profile.current_work_description || '')
        setGenresWrite(profile.genres_write || '')
        setGenresRead(profile.genres_read || '')
        setSubstackUrl(profile.substack_url || '')
        setTwitterUrl(profile.twitter_url || '')
        setInstagramUrl(profile.instagram_url || '')
        setWebsiteUrl(profile.website_url || '')
        setAvatarUrl(profile.avatar_url || null)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  function addWorkLink() {
    if (workLinks.length >= 5) return
    setWorkLinks([...workLinks, { label: '', url: '' }])
  }

  function updateWorkLink(index: number, field: 'label' | 'url', value: string) {
    setWorkLinks(workLinks.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  function removeWorkLink(index: number) {
    setWorkLinks(workLinks.filter((_, i) => i !== index))
  }

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

    const cleanedWorkLinks = workLinks
      .filter((l) => l.url.trim() !== '')
      .map((l) => ({ label: l.label.trim() || l.url.trim(), url: l.url.trim() }))

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        first_name: firstName || null,
        last_name: lastName || null,
        occupation: occupation || null,
        book_title: bookTitle || null,
        work_links: cleanedWorkLinks,
        bio: bio,
        current_work_description: currentWork,
        genres_write: genresWrite,
        genres_read: genresRead,
        substack_url: substackUrl,
        twitter_url: twitterUrl,
        instagram_url: instagramUrl,
        website_url: websiteUrl,
        avatar_url: newAvatarUrl,
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setError(error.message)
    } else {
      router.back()
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
        <div
          className="rounded-xl mb-6"
          style={{ border: '1px solid var(--color-rule)', padding: '1.25rem' }}
        >
          <h2 className="text-xs mb-4" style={{ color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            About you
          </h2>

          <div className="mb-5">
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
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full py-2 border-b bg-transparent focus:outline-none"
                style={{ borderColor: 'var(--color-rule)' }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full py-2 border-b bg-transparent focus:outline-none"
                style={{ borderColor: 'var(--color-rule)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Occupation</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Teacher, Software Engineer"
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
        </div>

        <div
          className="rounded-xl mb-6"
          style={{ border: '1px solid var(--color-rule)', padding: '1.25rem' }}
        >
          <h2 className="text-xs mb-4" style={{ color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Your writing
          </h2>

          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Current book title</label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="The title of what you're writing"
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>What I&apos;ve been working on</label>
            <textarea
              value={currentWork}
              onChange={(e) => setCurrentWork(e.target.value)}
              rows={3}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>

          <label className="block text-sm mb-2" style={{ color: 'var(--color-ink-muted)' }}>
            Links to your current work
          </label>
          {workLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateWorkLink(i, 'label', e.target.value)}
                placeholder="Label (e.g. Read Chapter 1)"
                className="w-2/5 py-2 border-b bg-transparent focus:outline-none text-sm"
                style={{ borderColor: 'var(--color-rule)' }}
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateWorkLink(i, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-1 py-2 border-b bg-transparent focus:outline-none text-sm"
                style={{ borderColor: 'var(--color-rule)' }}
              />
              <button
                type="button"
                onClick={() => removeWorkLink(i)}
                aria-label="Remove link"
                style={{ color: 'var(--color-ink-muted)' }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {workLinks.length < 5 && (
            <button
              type="button"
              onClick={addWorkLink}
              className="flex items-center gap-1.5 text-sm mt-2"
              style={{ color: 'var(--color-accent)' }}
            >
              <Plus size={15} />
              Add a link
            </button>
          )}
        </div>

        <div
          className="rounded-xl mb-6"
          style={{ border: '1px solid var(--color-rule)', padding: '1.25rem' }}
        >
          <h2 className="text-xs mb-4" style={{ color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            More about you
          </h2>

          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>About me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
          <div className="mb-4">
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
          <div>
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
        </div>

        <div
          className="rounded-xl mb-6"
          style={{ border: '1px solid var(--color-rule)', padding: '1.25rem' }}
        >
          <h2 className="text-xs mb-4" style={{ color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Elsewhere on the web
          </h2>

          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Substack</label>
            <input
              type="url"
              value={substackUrl}
              onChange={(e) => setSubstackUrl(e.target.value)}
              placeholder="https://yourname.substack.com"
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Twitter / X</label>
            <input
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://x.com/yourname"
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Instagram</label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/yourname"
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Website</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full py-2 border-b bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--color-rule)' }}
            />
          </div>
        </div>

        {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 text-sm rounded-lg"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)' }}
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </main>
  )
}
