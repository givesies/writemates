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

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>{profile.display_name || profile.username}</h1>
      <p style={{ color: '#666' }}>@{profile.username}</p>

      {profile.bio && (
        <p style={{ marginTop: '1.5rem' }}>{profile.bio}</p>
      )}

      {profile.current_work_description && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Currently working on</h2>
          <p>{profile.current_work_description}</p>
        </div>
      )}
    </main>
  )
}
