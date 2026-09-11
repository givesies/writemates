'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
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
        { href: '/settings', label: 'Settings' },
      ]
    : [
        { href: '/login', label: 'Log in' },
        { href: '/signup', label: 'Sign up' },
      ]

  return (
    <nav className="border-b" style={{ borderColor: 'var(--color-rule)' }}>
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-8" style={{ fontFamily: 'var(--font-sans)' }}>
        <Link
          href="/"
          className="text-lg flex items-baseline gap-2"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
        >
          Writemates
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--color-ink-muted)' }}
          >
            beta
          </span>
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
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ color: 'var(--color-ink)' }}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
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