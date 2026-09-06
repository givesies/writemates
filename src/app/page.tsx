import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
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

  function latestWordCountFor(projectId: string) {
    const wordcountPosts = (posts || []).filter(
      (p) => p.type === 'wordcount' && p.project_id === projectId
    )
    return wordcountPosts.length > 0 ? wordcountPosts[0].word_count : null
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>{profile.display_name || profile.username}</h1>
      <p style={{ color: '#666' }}>@{profile.username}</p>

      {profile.bio && <p style={{ marginTop: '1.5rem' }}>{profile.bio}</p>}

      {profile.current_work_description && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Currently working on</h2>
          <p>{profile.current_work_description}</p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Projects</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {projects.map((project) => {
              const current = latestWordCountFor(project.id)
              const percent =
                current && project.goal_word_count
                  ? Math.min(100, Math.round((current / project.goal_word_count) * 100))
                  : null
              return (
                <li
                  key={project.id}
                  style={{ padding: '0.75rem 0', borderBottom: '1px solid #eee' }}
                >
                  <strong>{project.title}</strong>
                  {current !== null && (
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      {current.toLocaleString()} words
                      {project.goal_word_count && (
                        <> — {percent}% of {project.goal_word_count.toLocaleString()} goal</>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {posts && posts.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Recent activity</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {posts.map((post) => (
              <li
                key={post.id}
                style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '0.75rem' }}
              >
                {post.type === 'wordcount' && (
                  <p>
                    📊 Wrote <strong>{post.word_count?.toLocaleString()}</strong> words
                    {post.projects?.title && <> on <em>{post.projects.title}</em></>}
                  </p>
                )}
                {post.type === 'snippet' && post.content && (
                  <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
                )}
                {post.type === 'link' && (
                  <p>
                    {post.content && <span>{post.content} — </span>}
                    <a href={post.link_url} target="_blank" rel="noopener noreferrer">
                      {post.link_url}
                    </a>
                  </p>
                )}
                <div style={{ color: '#999', fontSize: '0.8rem' }}>
                  {new Date(post.updated_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}