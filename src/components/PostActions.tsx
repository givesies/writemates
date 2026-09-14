'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Heart, Share2, Trash2 } from 'lucide-react'

export default function PostActions({
  postId,
  initialLiked,
  initialLikeCount,
  isOwner,
}: {
  postId: string
  initialLiked: boolean
  initialLikeCount: number
  isOwner?: boolean
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialLikeCount)
  const [copied, setCopied] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const confirmed = window.confirm('Delete this post? This can\'t be undone.')
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) {
      setDeleted(true)
      router.refresh()
    }
  }

  async function toggleLike() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)
      setLiked(false)
      setCount((c) => c - 1)
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      setLiked(true)
      setCount((c) => c + 1)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${postId}`
    const nav = navigator as Navigator & { share?: (data: { url: string }) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ url })
      } catch {
        // person cancelled the share sheet, nothing to do
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (deleted) {
    return (
      <p className="mt-3 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
        Post deleted.
      </p>
    )
  }

  return (
    <div className="flex items-center gap-4 mt-3" style={{ fontFamily: 'var(--font-sans)' }}>
      <button
        onClick={toggleLike}
        className="flex items-center gap-1 text-sm"
        style={{ color: liked ? 'var(--color-accent)' : 'var(--color-ink-muted)' }}
      >
        <Heart size={16} fill={liked ? 'var(--color-accent)' : 'none'} />
        {count > 0 && count}
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-1 text-sm"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <Share2 size={16} />
        {copied ? 'Copied!' : 'Share'}
      </button>
      {isOwner && (
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-sm ml-auto"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          <Trash2 size={16} />
          Delete
        </button>
      )}
    </div>
  )
}