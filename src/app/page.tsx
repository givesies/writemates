'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [status, setStatus] = useState('Checking connection...')

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.from('_test_').select('*').limit(1)

      // We expect an error here since no tables exist yet —
      // but the TYPE of error tells us if the connection itself worked.
      if (error && error.code === 'PGRST205') {
        setStatus('✅ Connected to Supabase! (No tables yet — that\'s expected)')
      } else if (error) {
        setStatus(`⚠️ Connected, but got: ${error.message}`)
      } else {
        setStatus('✅ Connected to Supabase!')
      }
    }
    checkConnection()
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Writemates — Connection Test</h1>
      <p>{status}</p>
    </main>
  )
}