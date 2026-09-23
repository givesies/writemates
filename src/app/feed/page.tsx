import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PenLine, ExternalLink } from 'lucide-react'
import PostActions from '@/components/PostActions'
import FeedFilterSwitcher from '@/components/FeedFilterSwitcher'

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view: viewParam } = await searchParams
  const view = viewParam === 'groups' ? 'groups' : 'public'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let posts: any[] = []
  let inNoGroups = false

  if (view === 'groups') {
    const { data: myGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    const groupIds = (myGroups || []).map((g) => g.group_id)

    if (groupIds.length === 0) {
      inNoGroups = true
    } else {
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id')
        .in('group_id', groupIds)

      const memberIds = Array.from(new Set((members || []).map((m) => m.user_id)))

      const { data } = await supabase
        .from('posts')
        .select('*, profiles(username, display_name, avatar_url), projects(title)')
        .in('user_id', memberIds)
        .order('updated_at', { ascending: false })

      posts = data || []
    }
  } else {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username, display_name, avatar_url), projects(title)')
      .order('updated_at', { ascending: false })

    posts = data || []
  }

  const { data: myLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', user.id)

  const likedPostIds = new Set((myLikes || []).map((l) => l.post_id))

  const { data: allLikes } = await supabase.from('likes').select('post_id')
  const likeCounts = new Map<string, number>()
  for (const like of allLikes || []) {
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) || 0) + 1)
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
          {view === 'groups' ? 'Groups Feed' : 'Public Feed'}
        </h1>
        <FeedFilterSwitcher initialView={view} />
      </div>

      {inNoGroups && (
        <p style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
          You&apos;re not in any groups yet — <Link href="/groups">join or create one</Link> to see their feed.
        </p>
      )}

      {!inNoGroups && posts.length === 0 && (
        <p style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
          No posts yet.
        </p>
      )}

      <div>
        {posts.map((post) => {
          const isVideo = Boolean(post.media_url && post.media_url.match(/\.(mp4|webm|mov)$/i))
          const authorName = post.profiles?.display_name || post.profiles?.username || '?'
          let linkDomain = ''
          if (post.link_url) {
            try {
              linkDomain = new URL(post.link_url).hostname.replace('www.', '')
            } catch {
              linkDomain = post.link_url
            }
          }

          return (
            <article
              key={post.id}
              className="mb-6 overflow-hidden"
              style={{ border: '1px solid var(--color-rule)', borderRadius: 14, backgroundColor: 'var(--color-paper)' }}
            >
              {post.media_url && isVideo && (
                <video
                  src={post.media_url}
                  controls
                  className="w-full"
                  style={{ maxHeight: 420, objectFit: 'cover', display: 'block' }}
                />
              )}

              {post.media_url && !isVideo && (
                <img
                  src={post.media_url}
                  alt=""
                  className="w-full"
                  style={{ maxHeight: 420, objectFit: 'cover', display: 'block' }}
                />
              )}

              <div className="p-5" style={{ fontFamily: 'var(--font-sans)' }}>
                <div className="flex items-center gap-3 mb-3">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-ink-muted)' }}
                    >
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/u/${post.profiles?.username}`} className="text-sm font-semibold block" style={{ color: 'var(--color-ink)' }}>
                      {authorName}
                    </Link>
                    <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                      {new Date(post.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {post.projects?.title ? ' · ' + post.projects.title : ''}
                    </p>
                  </div>
                </div>

                {post.type === 'wordcount' && (
                  <div
                    className="flex items-center gap-3 rounded-lg mb-1"
                    style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.75rem 1rem' }}
                  >
                    <PenLine size={18} style={{ color: 'var(--color-accent)' }} />
                    <p className="text-base">
                      Wrote <strong style={{ color: 'var(--color-accent)' }}>{post.word_count?.toLocaleString()}</strong> words today
                    </p>
                  </div>
                )}

                {post.type === 'snippet' && post.content && (
                  <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-serif)', fontSize: '1.15rem', lineHeight: 1.5 }}>
                    {post.content}
                  </p>
                )}

                {post.type === 'link' && post.link_url && (
                  <div>
                    {post.content && <p className="mb-3">{post.content}</p>}
                    <a
                      href={post.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden"
                      style={{ border: '1px solid var(--color-rule)', borderRadius: 10 }}
                    >
                      {post.link_image_url && (
                        <img
                          src={post.link_image_url}
                          alt=""
                          className="w-full"
                          style={{ maxHeight: 260, objectFit: 'cover', display: 'block' }}
                        />
                      )}
                      <div className="p-3">
                        {post.link_title ? (
                          <>
                            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-ink)' }}>
                              {post.link_title}
                            </p>
                            {post.link_description && (
                              <p
                                className="text-sm mb-2"
                                style={{
                                  color: 'var(--color-ink-muted)',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {post.link_description}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm mb-2" style={{ color: 'var(--color-ink)' }}>{post.link_url}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                          <ExternalLink size={12} />
                          <span>{linkDomain}</span>
                        </div>
                      </div>
                    </a>
                  </div>
                )}

                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-rule)' }}>
                  <PostActions
                    postId={post.id}
                    initialLiked={likedPostIds.has(post.id)}
                    initialLikeCount={likeCounts.get(post.id) || 0}
                    isOwner={post.user_id === user.id}
                  />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
