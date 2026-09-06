import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function NavBar({ username }: { username: string | null }) {
  return (
    <nav
      style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        fontFamily: 'sans-serif',
      }}
    >
      <Link href="/" style={{ fontWeight: 'bold' }}>Writemates</Link>
      {username ? (
        <>
          <Link href="/feed">Feed</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/projects/log">Log Wordcount</Link>
          <Link href="/post/new">Share</Link>
          <Link href="/profile/edit">Edit Profile</Link>
          <Link href={`/u/${username}`}>Public Profile</Link>
          <div style={{ marginLeft: 'auto' }}>
            <LogoutButton />
          </div>
        </>
      ) : (
        <>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </>
      )}
    </nav>
  )
}
