'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20)

    setResults(data || [])
    setSearched(true)
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Find writers
      </h1>
      <form onSubmit={handleSearch} style={{ fontFamily: 'var(--font-sans)' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username"
          className="w-full py-2 mb-4 border-b bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--color-rule)' }}
        />
        <button
          type="submit"
          className="px-5 py-2 text-sm mb-8"
          style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Search
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
            className="flex items-center gap-3 py-3 border-b"
            style={{ borderColor: 'var(--color-rule)' }}
          >
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <div style={{ fontFamily: 'var(--font-sans)' }}>
                {profile.display_name || profile.username}
              </div>
              <div className="text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                @{profile.username}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}