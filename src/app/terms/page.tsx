import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use · Writemates',
  description: 'The rules for using Writemates.',
}

const LAST_UPDATED = '2 October 2026'

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: 'Agreeing to these terms',
    body: (
      <p>
        By creating an account or using Writemates (on the web or in our iOS app) you agree to these
        Terms of Use and to our <a href="/privacy" style={{ color: 'var(--color-accent)' }}>Privacy Policy</a>.
        If you don’t agree, please don’t use Writemates.
      </p>
    ),
  },
  {
    heading: 'Who can use Writemates',
    body: (
      <p>
        You must be at least 13 years old. You are responsible for keeping your login details safe and
        for everything that happens under your account.
      </p>
    ),
  },
  {
    heading: 'Your content',
    body: (
      <p>
        You own what you post — your posts, images, messages, profile and writing progress. You give
        Writemates permission to store and display that content to other users as needed to run the
        service. We never claim ownership of your writing, and we don’t use it to train AI models.
      </p>
    ),
  },
  {
    heading: 'Community rules',
    body: (
      <>
        <p className="mb-3">
          Writemates is for writers supporting each other. There is no tolerance for objectionable
          content or abusive behaviour. You must not post, send or share anything that:
        </p>
        <ul>
          <li>harasses, bullies, threatens or demeans another person;</li>
          <li>is hateful or discriminatory, or promotes violence;</li>
          <li>is sexually explicit or pornographic;</li>
          <li>is illegal, or infringes someone else’s copyright or other rights;</li>
          <li>is spam, a scam, or impersonates someone else.</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Reporting and blocking',
    body: (
      <p>
        You can report any post or user, and block any user, from within the app. Blocking someone
        removes their posts from your feed and stops them from messaging you. We review reports and act
        on objectionable content within 24 hours, which may include removing the content and suspending
        or permanently removing the account responsible.
      </p>
    ),
  },
  {
    heading: 'Ending your account',
    body: (
      <p>
        You can delete your account at any time in Settings → Delete account. We may suspend or
        remove accounts that break these terms.
      </p>
    ),
  },
  {
    heading: 'The service',
    body: (
      <p>
        Writemates is provided “as is”. We work hard to keep it running and your data safe, but we can’t
        promise it will always be available or error-free, and to the extent the law allows we are not
        liable for losses arising from your use of it. Nothing in these terms limits rights you have
        under consumer law that cannot be excluded.
      </p>
    ),
  },
  {
    heading: 'Changes',
    body: (
      <p>
        We may update these terms. If we make meaningful changes we will update this page and the date
        at the top. Continuing to use Writemates after a change means you accept the updated terms.
      </p>
    ),
  },
  {
    heading: 'Contact',
    body: (
      <p>
        Questions, or need to report something? Email{' '}
        <a href="mailto:hello@writemates.app" style={{ color: 'var(--color-accent)' }}>hello@writemates.app</a>.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <main
      className="max-w-2xl mx-auto px-6 py-16"
      style={{ fontFamily: 'var(--font-sans)', backgroundColor: 'var(--color-paper)' }}
    >
      <h1 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Terms of Use
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--color-ink-muted)' }}>
        Last updated {LAST_UPDATED}
      </p>

      {sections.map((s) => (
        <section key={s.heading} className="mb-8">
          <h2 className="text-xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            {s.heading}
          </h2>
          <div
            className="text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
            style={{ color: 'var(--color-ink-muted)', lineHeight: 1.7 }}
          >
            {s.body}
          </div>
        </section>
      ))}
    </main>
  )
}
