'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Newspaper, Users, Bell, Plus, X, PenLine, FolderPlus, Share2, Upload, Timer } from 'lucide-react'
import UnreadChatDot from '@/components/UnreadChatDot'
import UnreadActivityDot from '@/components/UnreadActivityDot'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { href: '/today', label: 'Today', icon: LayoutDashboard },
  { href: '/feed', label: 'Feed', icon: Newspaper },
  { href: '/chat', label: 'Mates', icon: Users },
  { href: '/activity', label: 'Activity', icon: Bell },
]

const actions = [
  { href: '/projects/log', label: 'Log wordcount', icon: PenLine },
  { href: '/projects', label: 'New project', icon: FolderPlus },
  { href: '/post/new', label: 'Share a post', icon: Share2 },
  { href: '/sprints', label: 'Start a sprint', icon: Timer },
  { href: '/read', label: 'Upload work-in-progress', icon: Upload },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logLabel, setLogLabel] = useState('Log wordcount')

  useEffect(() => {
    async function loadUnit() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let projectId = localStorage.getItem('wm_current_project')

      const { data: projects } = await supabase
        .from('projects')
        .select('id, metric_unit')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!projects || projects.length === 0) return

      let project = projects.find((p) => p.id === projectId)
      if (!project) project = projects[0]

      setLogLabel(project.metric_unit === 'pages' ? 'Log page count' : 'Log word count')
    }
    loadUnit()
  }, [])

  return (
    <>
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 45,
          }}
        />
      )}

      {menuOpen && (
        <div
          className="fixed bottom-24 left-1/2 rounded-2xl overflow-hidden"
          style={{
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-paper)',
            border: '1px solid var(--color-rule)',
            zIndex: 46,
            width: '85%',
            maxWidth: 320,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {actions.map((action) => {
            const Icon = action.icon
            const label = action.href === '/projects/log' ? logLabel : action.label
            return (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-4 border-b"
                style={{ borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
              >
                <Icon size={18} style={{ color: 'var(--color-accent)' }} />
                <span className="text-sm">{label}</span>
              </Link>
            )
          })}
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 border-t z-40"
        style={{ backgroundColor: 'var(--color-paper)', borderColor:'var(--color-rule)' }}
      >
        <div className="max-w-5xl mx-auto" style={{ position: 'relative' }}>
          <div className="flex items-center justify-around py-2">
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

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open create menu'}
            style={{
              position: 'absolute',
              top: -26,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid var(--color-paper)',
            }}
          >
            {menuOpen ? <X size={22} /> : <Plus size={22} />}
          </button>
        </div>
      </nav>
    </>
  )
}
