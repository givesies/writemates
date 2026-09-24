import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Users, UserCheck } from 'lucide-react'
import FollowButton from '@/components/FollowButton'
import MessageButton from '@/components/MessageButton'
import { buildDailyCumulative } from '@/lib/wordcountStats'

type WorkLink = { label: string; url: string }

const PROJECT_TYPE_LABELS: Record<string, string> = {
  book: 'Novel',
  screenplay: 'Screenplay',
  article: 'Article',
  short_story: 'Short story',
  thesis: 'Thesis',
  other: 'Project',
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user: viewer } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id)

  let isFollowing = false
  if (viewer && viewer.id !== profile.id) {
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', viewer.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    isFollowing = !!existingFollow
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const { data: posts } = await supabase
    .from('posts')
    .select('*, projects(title)')
    .eq('user_id', profile.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  const isOwner = viewer?.id === profile.id
  const workLinks: WorkLink[] = Array.isArray(profile.work_links) ? profile.work_links : []
  const writeGenres = (profile.genres_write || '').split(',').map((g: string) => g.trim()).filter(Boolean)
  const readGenres = (profile.genres_read || '').split(',').map((g: string) => g.trim()).filter(Boolean)

  function latestWordCountFor(projectId: string) {
    const wordcountPosts = (posts || []).filter(
      (p) => p.type === 'wordcount' && p.project_id === projectId
    )
    return wordcountPosts.length > 0 ? wordcountPosts[0].word_count : null
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div
        className="rounded-xl p-6 mb-6"
        style={{ border: '1px solid var(--color-rule)', backgroundColor: 'var(--color-paper)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                {profile.display_name || profile.username}
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                @{profile.username}
                {profile.occupation && <> · {profile.occupation}</>}
              </p>
            </div>
          </div>
          {isOwner && (
            <Link href="/profile/edit" aria-label="Edit profile" title="Edit profile" style={{ color: 'var(--color-ink-muted)' }}>
              <Pencil size={18} />
            </Link>
          )}
        </div>

        <div
          className="flex items-center gap-5 mt-4 text-sm"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
        >
          <span className="flex items-center gap-1.5">
            <Users size={15} /> {followerCount || 0} followers
          </span>
          <span className="flex items-center gap-1.5">
            <UserCheck size={15} /> {followingCount || 0} following
          </span>
          {viewer && viewer.id !== profile.id && (
            <>
              <FollowButton profileId={profile.id} initialFollowing={isFollowing} />
              <MessageButton profileId={profile.id} />
            </>
          )}
        </div>

        {profile.bio && <p className="mt-5 text-lg" style={{ lineHeight: 1.6 }}>{profile.bio}</p>}

        {(profile.book_title || profile.current_work_description || workLinks.length > 0) && (
          <div
            className="mt-5 rounded-lg"
            style={{ backgroundColor: 'var(--color-paper-raised)', padding: '0.9rem 1rem' }}
          >
            <h2
              className="text-xs mb-1"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
            >
              Currently working on
            </h2>
            {profile.book_title && (
              <p className="text-lg mb-1" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                {profile.book_title}
              </p>
            )}
            {profile.current_work_description && (
              <p className="mb-2" style={{ lineHeight: 1.6 }}>{profile.current_work_description}</p>
            )}
            {workLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {workLinks.map((link, i) => (
                    <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm rounded-full"
                    style={{
                      border: '1px solid var(--color-rule)',
                      backgroundColor: 'var(--color-paper)',
                      color: 'var(--color-accent)',
                      padding: '0.35rem 0.75rem',
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {(writeGenres.length > 0 || readGenres.length > 0) && (
          <div className="mt-5">
            {writeGenres.length > 0 && (
              <div className="mb-2">
                <span className="text-xs mr-2" style={{ color: 'var(--color-ink-muted)' }}>Writes</span>
                <span className="inline-flex flex-wrap gap-1.5">
                  {writeGenres.map((g: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs rounded-full"
                      style={{ backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-ink)', padding: '0.2rem 0.6rem' }}
                    >
                      {g}
                    </span>
                  ))}
                </span>
              </div>
            )}
            {readGenres.length > 0 && (
              <div>
                <span className="text-xs mr-2" style={{ color: 'var(--color-ink-muted)' }}>Reads</span>
                <span className="inline-flex flex-wrap gap-1.5">
                  {readGenres.map((g: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs rounded-full"
                      style={{ backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-ink)', padding: '0.2rem 0.6rem' }}
                    >
                      {g}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        )}

        {(profile.substack_url || profile.twitter_url || profile.instagram_url || profile.website_url) && (
          <div className="mt-5 flex items-center gap-3">
            {profile.substack_url && (
              <a
                href={`${profile.substack_url.replace(/\/$/, '')}/subscribe`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe on Substack"
                className="flex items-center gap-2 text-sm rounded-full"
                style={{ border: '1px solid var(--color-rule)', padding: '0.35rem 0.75rem 0.35rem 0.35rem' }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: '#FF6719', color: '#fff', fontWeight: 700, fontSize: 13 }}
                >
                  S
                </span>
                <span style={{ color: 'var(--color-accent)' }}>Subscribe To My Substack</span>
              </a>
            )}
            {profile.twitter_url && (
              <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--color-accent)' }}>Twitter</a>
            )}
            {profile.instagram_url && (
              <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--color-accent)' }}>Instagram</a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--color-accent)' }}>Website</a>
            )}
          </div>
        )}
      </div>

      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2
            className="text-sm mb-3"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
          >
            Projects
          </h2>
          {projects.map((project) => {
            const current = latestWordCountFor(project.id)
            const percent =
              current && project.goal_word_count
                ? Math.min(100, Math.round((current / project.goal_word_count) * 100))
                : null
            const typeLabel = PROJECT_TYPE_LABELS[project.project_type] || 'Project'
            const startedLabel = new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
            return (
              <div
                key={project.id}
                className="rounded-lg mb-3"
                style={{ border: '1px solid var(--color-rule)', backgroundColor: 'var(--color-paper)', padding: '1rem' }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-lg">{project.title}</span>
                  {percent !== null && (
                    <span
                      className="text-sm"
                      style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-accent)' }}
                    >
                      {percent}%
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                  {typeLabel} · started {startedLabel}
                </p>
                {current !== null && (
                  <>
                    <div
                      className="mt-2 h-1.5 w-full rounded-full"
                      style={{ backgroundColor: 'var(--color-paper-raised)', position: 'relative' }}
                    >
                      {percent !== null && (
                        <div
                          className="h-1.5 absolute top-0 left-0 rounded-full"
                          style={{ width: `${percent}%`, backgroundColor: 'var(--color-accent)' }}
                        />
                      )}
                    </div>
                    <div
                      className="mt-2 text-sm"
                      style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
                    >
                      {current.toLocaleString()} words
                      {project.goal_word_count && <> of {project.goal_word_count.toLocaleString()} goal</>}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {posts && posts.length > 0 && (
        <div>
          <h2
            className="text-sm mb-3"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
          >
            Recent activity
          </h2>
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg mb-3"
              style={{ border: '1px solid var(--color-rule)', backgroundColor: 'var(--color-paper)', padding: '1rem' }}
            >
              <div
                className="text-xs mb-2"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
              >
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
                  words
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
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
