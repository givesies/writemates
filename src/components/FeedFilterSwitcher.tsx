'use client'

import { useRouter } from 'next/navigation'

export default function FeedFilterSwitcher({ initialView }: { initialView: string }) {
  const router = useRouter()

  return (
    <select
      value={initialView}
      onChange={(e) => router.push(`/feed?view=${e.target.value}`)}
      className="text-sm bg-transparent border-b py-1 focus:outline-none"
      style={{ borderColor: 'var(--color-rule)', color: 'var(--color-ink-muted)' }}
    >
      <option value="public">Public feed</option>
      <option value="groups">My groups</option>
    </select>
  )
}
