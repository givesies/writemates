'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Group = {
  id: string
  name: string
}

export default function NewPostPage() {
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [visibility, setVisibility] = useState<'everyone' | 'groups'>('everyone')
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadGroups() {
      const supabase = createClient()
      const { data } = await supabase.from('groups').select('id, name')
      setGroups(data || [])
    }
    loadGroups()
  }, [])

  function toggleGroup(groupId: string) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let mediaUrl: string | null = null

    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, mediaFile)

      if (uploadError) {
        setSaving(false)
        setError(`Upload failed: ${uploadError.message}`)
        return
      }

      const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(filePath)
      mediaUrl = urlData.publicUrl
    }

    const { data: newPost, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        type: linkUrl ? 'link' : 'snippet',
        content: content || null,
        link_url: linkUrl || null,
        media_url: mediaUrl,
      })
      .select()
      .single()

    if (postError) {
      setSaving(false)
      setError(postError.message)
      return
    }

    if (visibility === 'groups' && selectedGroupIds.length > 0) {
      const shareRows = selectedGroupIds.map((groupId) => ({
        post_id: newPost.id,
        group_id: groupId,
      }))
      const { error: shareError } = await supabase.from('post_shares').insert(shareRows)
      if (shareError) {
        setSaving(false)
        setError(`Post created, but sharing failed: ${shareError.message}`)
        return
      }
    }

    setSaving(false)
    router.push('/')
    router.refresh()
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Share something
      </h1>
      <form onSubmit={handleSubmit} style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Text (a snippet, thought, update...)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Link (optional — e.g. your Substack post)</label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="w-full py-2 border-b bg-transparent focus:outline-none"
            style={{ borderColor: 'var(--color-rule)' }}
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-ink-muted)' }}>Image or video (optional)</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm mb-2" style={{ color: 'var(--color-ink-muted)' }}>Who can see this?</label>
          <label className="mr-4 text-sm">
            <input
              type="radio"
              checked={visibility === 'everyone'}
              onChange={() => setVisibility('everyone')}
              className="mr-1"
            /> Everyone
          </label>
          <label className="text-sm">
            <input
              type="radio"
              checked={visibility === 'groups'}
              onChange={() => setVisibility('groups')}
              className="mr-1"
            /> Specific groups
          </label>
        </div>

        {visibility === 'groups' && (
          <div className="mb-5 pl-4">
            {groups.length === 0 && <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>You don&apos;t have any groups yet.</p>}
            {groups.map((group) => (
              <label key={group.id} className="block mb-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedGroupIds.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                  className="mr-2"
                /> {group.name}
              </label>
            ))}
          </div>
        )}

        {error && <p className="mb-4 text-sm" style={{ color: '#a33' }}>{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-sm"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          {saving ? 'Posting...' : 'Post'}
        </button>
      </form>
    </main>
  )
}