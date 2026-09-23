'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  occupation: string | null
  book_title: string | null
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase.rpc('search_profiles', { search_query: query.trim() })

    setResults(data || [])
    setSearched(true)
    setSearching(false)
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Find writers
      </h1>
      <p className="text-sm mb-6" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
        Search by name, username, occupation, book title — or their exact email.
      </p>
      <form onSubmit={handleSearch} style={{ fontFamily: 'var(--font-sans)' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full py-2 mb-4 border-b bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--color-rule)' }}
        />
        <button
          type="submit"
          disabled={searching}
          className="px-5 py-2 text-sm mb-8"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)' }}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && results.length === 0 && (
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
          No writers found.
        </p>
      )}

      <div>
        {results.map((profile) => (
          <Link
            key={profile.id}
            href={`/u/${profile.username}`}
            className="flex items-center gap-3 mb-3 rounded-lg"
            style={{
              border: '1px solid var(--color-rule)',
              backgroundColor: 'var(--color-paper)',
              padding: '0.85rem 1rem',
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-ink-muted)' }}
              >
                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink)' }}>
                {profile.display_name || profile.username}
              </div>
              <div className="text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                @{profile.username}
                {profile.occupation && <> · {profile.occupation}</>}
              </div>
              {profile.book_title && (
                <div className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-accent)' }}>
                  Writing &ldquo;{profile.book_title}&rdquo;
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
