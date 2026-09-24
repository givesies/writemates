'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Library, PenLine, Settings as SettingsIcon, LogIn, UserPlus } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default function NavBar({
  username,
  avatarUrl,
}: {
  username: string | null
  avatarUrl?: string | null
}) {
  const [open, setOpen] = useState(false)

  const links = username
    ? [
        { href: '/projects', label: 'Projects', icon: Library },
        { href: '/projects/log', label: 'Log wordcount', icon: PenLine },
        { href: '/settings', label: 'Settings', icon: SettingsIcon },
      ]
    : [
        { href: '/login', label: 'Log in', icon: LogIn },
        { href: '/signup', label: 'Sign up', icon: UserPlus },
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

        <div className="flex items-center gap-4">
          {username && (
            <>
              <Link href="/search" aria-label="Search" style={{ color: 'var(--color-ink)' }}>
                <Search size={20} />
              </Link>
              <Link href={`/u/${username}`} aria-label="Your profile">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: 'var(--color-rule)', color: 'var(--color-ink-muted)' }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </>
          )}

          <button
            onClick={() => setOpen(true)}
            style={{ color: 'var(--color-ink)' }}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 transition-opacity"
        style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 45,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      <div
        className="fixed top-0 right-0 h-full transition-transform duration-300 ease-in-out"
        style={{
          width: '82%',
          maxWidth: 320,
          backgroundColor: 'var(--color-paper)',
          zIndex: 46,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          fontFamily: 'var(--font-sans)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-5 border-b"
          style={{ borderColor: 'var(--color-rule)' }}
        >
          {username ? (
            <Link href={`/u/${username}`} onClick={() => setOpen(false)} className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-ink-muted)' }}
                >
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>@{username}</span>
            </Link>
          ) : (
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-accent)' }}>Writemates</span>
          )}
          <button onClick={() => setOpen(false)} aria-label="Close menu" style={{ color: 'var(--color-ink-muted)' }}>
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col px-5 py-3 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 text-sm py-3 border-b"
                style={{ color: 'var(--color-ink)', borderColor: 'var(--color-rule)' }}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} style={{ color: 'var(--color-accent)' }} />
                {link.label}
              </Link>
            )
          })}
        </div>

        {username && (
          <div className="px-5 py-5 border-t" style={{ borderColor: 'var(--color-rule)' }}>
            <LogoutButton />
          </div>
        )}
      </div>
    </nav>
  )
}
