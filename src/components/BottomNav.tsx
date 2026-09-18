'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, BookOpen, MessageCircle, Bell } from 'lucide-react'
import UnreadChatDot from '@/components/UnreadChatDot'
import UnreadActivityDot from '@/components/UnreadActivityDot'

const tabs = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/projects', label: 'Progress', icon: TrendingUp },
  { href: '/read', label: 'Read', icon: BookOpen },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/activity', label: 'Activity', icon: Bell },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t z-40"
      style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-3 py-1"
              style={{
                fontFamily: 'var(--font-sans)',
                color: active ? 'var(--color-accent)' : 'var(--color-ink-muted)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={22} />
                {tab.href === '/chat' && <UnreadChatDot />}
                {tab.href === '/activity' && <UnreadActivityDot />}
              </div>
              <span className="text-xs">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}