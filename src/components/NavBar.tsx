import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function NavBar({ username }: { username: string | null }) {
  return (
    <nav className="border-b" style={{ borderColor: 'var(--color-rule)' }}>
      <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-6" style={{ fontFamily: 'var(--font-sans)' }}>
        <Link
          href="/"
          className="text-lg mr-2"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
        >
          Writemates
        </Link>
        {username ? (
          <>
            <Link href="/feed" className="text-sm" style={{ color: 'var(--color-ink)' }}>Feed</Link>
            <Link href="/projects" className="text-sm" style={{ color: 'var(--color-ink)' }}>Projects</Link>
            <Link href="/projects/log" className="text-sm" style={{ color: 'var(--color-ink)' }}>Log wordcount</Link>
            <Link href="/post/new" className="text-sm" style={{ color: 'var(--color-ink)' }}>Share</Link>
            <Link href="/groups" className="text-sm" style={{ color: 'var(--color-ink)' }}>Groups</Link>
            <Link href="/profile/edit" className="text-sm" style={{ color: 'var(--color-ink)' }}>Edit profile</Link>
            <Link href={`/u/${username}`} className="text-sm" style={{ color: 'var(--color-ink)' }}>Profile</Link>
            <div className="ml-auto text-sm">
              <LogoutButton />
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm">Log in</Link>
            <Link href="/signup" className="text-sm">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}