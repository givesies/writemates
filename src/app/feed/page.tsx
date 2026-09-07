import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(username, display_name, avatar_url), projects(title)')
    .order('updated_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1
        className="text-3xl mb-10"
        style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
      >
        Feed
      </h1>

      {(!posts || posts.length === 0) && (
        <p style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
          No posts yet.
        </p>
      )}

      <div>
        {posts?.map((post) => (
          <article
            key={post.id}
            className="py-6 border-t"
            style={{ borderColor: 'var(--color-rule)' }}
          >
            <div
              className="flex items-center gap-2 text-sm mb-2"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
            >
              {post.profiles?.avatar_url && (
                <img
                  src={post.profiles.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <Link href={`/u/${post.profiles?.username}`} style={{ color: 'var(--color-ink-muted)' }}>
                {post.profiles?.display_name || post.profiles?.username}
              </Link>
              {' · '}
              {new Date(post.updated_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </div>

            {post.type === 'wordcount' && (
              <p className="text-lg">
                Wrote{' '}
                <strong style={{ color: 'var(--color-accent)' }}>
                  {post.word_count?.toLocaleString()}
                </strong>{' '}
                words today
                {post.projects?.title && <> on <em>{post.projects.title}</em></>}
              </p>
            )}

            {post.type === 'snippet' && post.content && (
              <p className="text-lg" style={{ whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>
            )}

            {post.media_url && (
              <div className="mt-3">
                {post.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={post.media_url} controls className="w-full rounded" />
                ) : (
                  <img src={post.media_url} alt="" className="w-full rounded" />
                )}
              </div>
            )}

            {post.type === 'link' && (
              <p className="text-lg">
                {post.content && <span>{post.content} — </span>}
                <a href={post.link_url} target="_blank" rel="noopener noreferrer">
                  {post.link_url}
                </a>
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}