export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)' }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 600,
          fontSize: '2.5rem',
          color: 'var(--color-ink)',
          marginBottom: '0.5rem',
        }}
      >
        Writemates
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.95rem',
          color: 'var(--color-ink-muted)',
        }}
      >
        Where Writers Grow Together
      </p>
    </div>
  )
}
