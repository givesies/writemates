import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FollowButton from '@/components/FollowButton'
import { buildDailyCumulative, getAuthorTitle } from '@/lib/wordcountStats'

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

  const { data: allSnapshots } = await supabase
    .from('wordcount_snapshots')
    .select('word_count, recorded_at, project_id')
    .eq('user_id', profile.id)

  const totalWordsAcrossProjects = (() => {
    const byProject = new Map<string, typeof allSnapshots>()
    for (const snap of allSnapshots || []) {
      const list = byProject.get(snap.project_id) || []
      list.push(snap)
      byProject.set(snap.project_id, list)
    }
    let total = 0
    for (const snaps of byProject.values()) {
      const daily = buildDailyCumulative(snaps!)
      const values = Array.from(daily.values())
      if (values.length > 0) total += Math.max(...values)
    }
    return total
  })()

  const authorTitle = getAuthorTitle(totalWordsAcrossProjects)

  function latestWordCountFor(projectId: string) {
    const wordcountPosts = (posts || []).filter(
      (p) => p.type === 'wordcount' && p.project_id === projectId
    )
    return wordcountPosts.length > 0 ? wordcountPosts[0].word_count : null
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-4xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            {profile.display_name || profile.username}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
            @{profile.username}
            {totalWordsAcrossProjects > 0 && (
              <span style={{ color: 'var(--color-accent)' }}> · {authorTitle}</span>
            )}
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-4 mt-4 text-sm"
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
      >
        <span>{followerCount || 0} followers</span>
        <span>{followingCount || 0} following</span>
        {viewer && viewer.id !== profile.id && (
          <FollowButton profileId={profile.id} initialFollowing={isFollowing} />
        )}
      </div>

      {profile.bio && <p className="mt-6 text-lg" style={{ lineHeight: 1.6 }}>{profile.bio}</p>}

      {profile.current_work_description && (
        <div className="mt-8">
          <h2
            className="text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}
          >
            Currently working on
          </h2>
          <p className="text-lg" style={{ lineHeight: 1.6 }}>{profile.current_work_description}</p>
        </div>
      )}

      {(profile.genres_write || profile.genres_read) && (
        <div className="mt-6 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          {profile.genres_write && <p>Writes: {profile.genres_write}</p>}
          {profile.genres_read && <p>Reads: {profile.genres_read}</p>}
        </div>
      )}

      {(profile.substack_url || profile.twitter_url || profile.instagram_url || profile.website_url) && (
        <div className="mt-6 flex gap-4 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
          {profile.substack_url && (
            <a href={profile.substack_url} target="_blank" rel="noopener noreferrer">Read my Substack</a>
          )}
          {profile.twitter_url && (
            <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">Twitter</a>
          )}
          {profile.instagram_url && (
            <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a>
          )}
          {profile.website_url && (
            <a href={profile.website_url} target="_blank" rel="noopener noreferrer">Website</a>
          )}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mt-12">
          <h2
            className="text-sm mb-4 pb-2 border-b"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)', borderColor: 'var(--color-rule)' }}
          >
            Projects
          </h2>
          <div>
            {projects.map((project) => {
              const current = latestWordCountFor(project.id)
              const percent =
                current && project.goal_word_count
                  ? Math.min(100, Math.round((current / project.goal_word_count) * 100))
                  : null
              return (
                <div key={project.id} className="py-4 border-b" style={{ borderColor: 'var(--color-rule)' }}>
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
                  {current !== null && (
                    <>
                      <div
                        className="mt-2 h-px w-full"
                        style={{ backgroundColor: 'var(--color-rule)', position: 'relative' }}
                      >
                        {percent !== null && (
                          <div
                            className="h-px absolute top-0 left-0"
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
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="mt-12">
          <h2
            className="text-sm mb-4 pb-2 border-b"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)', borderColor: 'var(--color-rule)' }}
          >
            Recent activity
          </h2>
          <div>
            {posts.map((post) => (
              <div key={post.id} className="py-5 border-b" style={{ borderColor: 'var(--color-rule)' }}>
                <div
                  className="text-sm mb-2"
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
        </div>
      )}
    </main>
  )
}