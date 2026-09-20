'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MinusCircle } from 'lucide-react'

export default function DeleteProjectButton({
  projectId,
  title,
  onDeleted,
}: {
  projectId: string
  title: string
  onDeleted?: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', projectId)
    setDeleting(false)
    setConfirming(false)

    if (!error) {
      if (onDeleted) {
        onDeleted()
      } else {
        router.push('/projects')
        router.refresh()
      }
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${title}`}
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <MinusCircle size={18} />
      </button>

      {confirming && (
        <div
          onClick={() => setConfirming(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-paper)',
              border: '1px solid var(--color-rule)',
              borderRadius: 12,
              padding: '1.5rem',
              maxWidth: 320,
              width: '85%',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <p className="text-sm mb-1" style={{ fontWeight: 600 }}>Delete &ldquo;{title}&rdquo;?</p>
            <p className="text-sm mb-5" style={{ color: 'var(--color-ink-muted)' }}>
              This removes the project and all its logged progress. This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="text-sm px-4 py-2"
                style={{ color: 'var(--color-ink-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm px-4 py-2"
                style={{ backgroundColor: '#a33', color: '#fff', borderRadius: 6 }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
