import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(username, display_name), projects(title)')
    .order('updated_at', { ascending: false })

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>Feed</h1>
      {(!posts || posts.length === 0) && <p>No posts yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts?.map((post) => (
          <li
            key={post.id}
            style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '0.75rem' }}
          >
            <div style={{ fontWeight: 'bold' }}>
              {post.profiles?.display_name || post.profiles?.username}
            </div>

            {post.type === 'wordcount' && (
              <p>
                📊 Wrote <strong>{post.word_count?.toLocaleString()}</strong> words today
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
    </main>
  )
}