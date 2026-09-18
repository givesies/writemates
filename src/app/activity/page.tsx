import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

type LikeActivity = {
  type: 'like'
  created_at: string
  actor: { username: string; display_name: string | null } | null
  post_content: string | null
}

type FollowActivity = {
  type: 'follow'
  created_at: string
  actor: { username: string; display_name: string | null } | null
}

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // My own posts, so we can find likes on them
  const { data: myPosts } = await supabase
    .from('posts')
    .select('id, content, type')
    .eq('user_id', user.id)

  const myPostIds = (myPosts || []).map((p) => p.id)
  const postContentById = new Map((myPosts || []).map((p) => [p.id, p.content || `a ${p.type} post`]))

  let likeActivity: LikeActivity[] = []
  if (myPostIds.length > 0) {
    const { data: likes } = await supabase
      .from('likes')
      .select('created_at, post_id, profiles(username, display_name)')
      .in('post_id', myPostIds)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    likeActivity = (likes || []).map((l) => ({
      type: 'like' as const,
      created_at: l.created_at,
      actor: l.profiles as unknown as { username: string; display_name: string | null } | null,
      post_content: postContentById.get(l.post_id) || null,
    }))
  }

  const { data: follows } = await supabase
    .from('follows')
    .select('created_at, profiles!follows_follower_id_fkey(username, display_name)')
    .eq('following_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const followActivity: FollowActivity[] = (follows || []).map((f) => ({
    type: 'follow' as const,
    created_at: f.created_at,
    actor: f.profiles as unknown as { username: string; display_name: string | null } | null,
  }))

  const allActivity = [...likeActivity, ...followActivity].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Mark activity as read now that this page has loaded
  await supabase
    .from('profiles')
    .update({ activity_last_read_at: new Date().toISOString() })
    .eq('id', user.id)

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Activity
      </h1>

      {allActivity.length === 0 && (
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          Nothing yet — likes and new followers will show up here.
        </p>
      )}

      <div>
        {allActivity.map((item, i) => {
          const name = item.actor?.display_name || item.actor?.username || 'Someone'
          return (
            <div key={i} className="py-4 border-b" style={{ borderColor: 'var(--color-rule)', fontFamily: 'var(--font-sans)' }}>
              {item.type === 'like' && (
                <p>
                  <Link href={`/u/${item.actor?.username}`} style={{ fontWeight: 600 }}>{name}</Link>
                  {' '}liked your post
                  {item.post_content && <span style={{ color: 'var(--color-ink-muted)' }}> — &ldquo;{item.post_content.slice(0, 40)}{item.post_content.length > 40 ? '...' : ''}&rdquo;</span>}
                </p>
              )}
              {item.type === 'follow' && (
                <p>
                  <Link href={`/u/${item.actor?.username}`} style={{ fontWeight: 600 }}>{name}</Link>
                  {' '}started following you
                </p>
              )}
              <div className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}