'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function NavBar({ username }: { username: string | null }) {
  const [open, setOpen] = useState(false)

  const links = username
    ? [
        { href: '/feed', label: 'Feed' },
        { href: '/projects', label: 'Projects' },
        { href: '/projects/log', label: 'Log wordcount' },
        { href: '/post/new', label: 'Share' },
        { href: '/groups', label: 'Groups' },
        { href: '/profile/edit', label: 'Edit profile' },
        { href: `/u/${username}`, label: 'Profile' },
      ]
    : [
        { href: '/login', label: 'Log in' },
        { href: '/signup', label: 'Sign up' },
      ]

  return (
    <nav className="border-b" style={{ borderColor: 'var(--color-rule)' }}>
<div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-8" style={{ fontFamily: 'var(--font-sans)' }}>        <Link
          href="/"
          className="text-lg"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
        >
          Writemates
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm" style={{ color: 'var(--color-ink)' }}>
              {link.label}
            </Link>
          ))}
          {username && <LogoutButton />}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-sm"
          onClick={() => setOpen(!open)}
          style={{ color: 'var(--color-ink)' }}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden px-6 pb-5 flex flex-col gap-4" style={{ fontFamily: 'var(--font-sans)' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm"
              style={{ color: 'var(--color-ink)' }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {username && <LogoutButton />}
        </div>
      )}
    </nav>
  )
}