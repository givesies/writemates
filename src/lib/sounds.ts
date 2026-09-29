let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return null
    audioCtx = new AudioContextClass()
  }
  return audioCtx
}

export function playSuccessChime() {
  const ctx = getContext()
  if (!ctx) return

  const notes = [523.25, 659.25, 783.99, 1046.5]
  const now = ctx.currentTime

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const startTime = now + i * 0.07
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(startTime)
    osc.stop(startTime + 0.25)
  })
}
