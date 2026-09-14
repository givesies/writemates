'use client'

import { useState } from 'react'

export default function InviteLink() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/signup`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-10" style={{ fontFamily: 'var(--font-sans)' }}>
      <p className="text-sm mb-3" style={{ color: 'var(--color-ink-muted)' }}>
        Share this link to invite other writers to Writemates.
      </p>
      <button
        onClick={handleCopy}
        className="px-5 py-2 text-sm"
        style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        {copied ? 'Copied!' : 'Copy invite link'}
      </button>
    </div>
  )
}