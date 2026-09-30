export default function MarketingPage() {
  return (
    <main style={{ fontFamily: 'var(--font-sans)', backgroundColor: 'var(--color-paper)' }}>
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">
        <p
          className="text-xs mb-4 inline-block px-3 py-1 rounded-full"
          style={{ backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-accent)', letterSpacing: '0.05em' }}
        >
          A WARNING LABEL, NOT A TAGLINE
        </p>
        <h1
          className="text-4xl mb-6"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, lineHeight: 1.15 }}
        >
          The only writing app that uses evil design tricks — for good.
        </h1>
        <p className="text-lg mb-4" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
          Meta spent billions engineering apps to keep you scrolling. We stole the same psychology
          — streaks, visual progress, the itch to beat your own record — and pointed it at something
          worth being addicted to.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
          Free to use. No credit card required.
        </p>
        <a
          href="/signup"
          className="inline-block px-8 py-3 text-sm"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)', borderRadius: 8, fontWeight: 600 }}
        >
          Start writing
        </a>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-14 border-t" style={{ borderColor: 'var(--color-rule)' }}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              Show Up — Every Day
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
              A slim streak counter and a row of daily checkmarks sit right at the top of your day —
              the same habit-loop that keeps you opening Duolingo before coffee, now pointed at your
              manuscript.
            </p>
          </div>
          <div
            className="rounded-lg p-4 w-full md:w-64"
            style={{ backgroundColor: 'var(--color-paper-raised)', border: '1px solid var(--color-rule)' }}
          >
            <div className="flex items-center justify-end gap-1 mb-3">
              <span style={{ fontSize: 14 }}>⚡</span>
              <span className="text-sm" style={{ fontWeight: 700, color: 'var(--color-accent)' }}>12</span>
            </div>
            <div className="flex justify-between">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{d}</span>
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: i < 5 ? 'var(--color-ink-muted)' : 'transparent',
                      border: i < 5 ? 'none' : '1px solid var(--color-rule)',
                      opacity: i < 5 ? 0.8 : 1,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-14 border-t" style={{ borderColor: 'var(--color-rule)' }}>
        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              See The Finish Line — Always
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
              Your projected finish date is never more than a glance away. Every session either pulls
              it closer or lets it drift — and the app makes sure you feel exactly which one just
              happened.
            </p>
          </div>
          <div
            className="rounded-lg p-4 w-full md:w-64"
            style={{ backgroundColor: 'var(--color-paper-raised)', border: '1px solid var(--color-rule)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--color-ink-muted)' }}>
              Keep it up. Your projected finish date is
            </p>
            <p className="text-lg mb-1" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-accent)' }}>
              14 Nov 2026
            </p>
            <p className="text-xs" style={{ color: '#16a34a', fontWeight: 600 }}>
              ↓ 3 days closer
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-14 border-t" style={{ borderColor: 'var(--color-rule)' }}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              Feel The Wins — Instantly
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
              Hit a new personal best and the numbers turn green, thicken, and chime — small,
              immediate rewards borrowed straight from the apps designed to keep you hooked.
            </p>
          </div>
          <div
            className="rounded-lg p-4 w-full md:w-64 grid grid-cols-2 gap-3"
            style={{ backgroundColor: 'var(--color-paper-raised)', border: '1px solid var(--color-rule)' }}
          >
            <div>
              <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>Today</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>1,240 words</p>
              <p className="text-xs" style={{ color: '#16a34a', fontWeight: 700 }}>↑ 300 more than yesterday</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>This week</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>6,100 words</p>
              <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>↓ 40 less than last week</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-14 border-t" style={{ borderColor: 'var(--color-rule)' }}>
        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              Work Faster — Together
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
              Set up a Sprint so you and other writers can write together and stay accountable to
              your word goals — no scores, no leaderboard, just shared momentum.
            </p>
          </div>
          <div
            className="rounded-lg p-4 w-full md:w-64 text-center"
            style={{ backgroundColor: 'var(--color-paper-raised)', border: '1px solid var(--color-rule)' }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--color-ink-muted)' }}>Sprint in progress</p>
            <p className="text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-accent)' }}>
              18:42
            </p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{ width: 22, height: 22, backgroundColor: 'var(--color-rule)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-16 text-center border-t" style={{ borderColor: 'var(--color-rule)' }}>
        <h2
          className="text-2xl mb-3"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
        >
          Writers are noticing the difference
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-ink-muted)' }}>
          Users report writing noticeably more since switching to Writemates.
        </p>
        <div className="rounded-lg p-6 mb-3" style={{ backgroundColor: 'var(--color-paper-raised)' }}>
          <p className="text-3xl" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-accent)' }}>
            up to [X]%
          </p>
          <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>more words written per week, self-reported by users</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
          [Placeholder — swap in a real figure once you have one to back it up]
        </p>
      </section>

      <section
        className="py-16 text-center"
        style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        <div className="max-w-md mx-auto px-6">
          <h2
            className="text-2xl mb-4"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
          >
            Only use this if you actually want to write more than you ever have.
          </h2>
          <p className="text-sm mb-2" style={{ opacity: 0.75 }}>
            Consider yourself warned. Then start your streak.
          </p>
          <p className="text-xs mb-8" style={{ opacity: 0.6 }}>
            Completely free. No credit card required.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-3 text-sm"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-paper)', borderRadius: 8, fontWeight: 600 }}
          >
            Join Writemates
          </a>
        </div>
      </section>
    </main>
  )
}
