import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy · Writemates',
  description: 'How Writemates collects, uses and protects your information.',
}

const LAST_UPDATED = '30 September 2026'

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: 'Who we are',
    body: (
      <p>
        Writemates is a social app for writers to track their writing, keep streaks, run sprints and
        connect with other writers. This policy explains what information we collect when you use
        Writemates (on the web or in our iOS app), how we use it, and the choices you have.
      </p>
    ),
  },
  {
    heading: 'Information you give us',
    body: (
      <ul>
        <li><strong>Account details</strong> — your email address, or your name and email from Google if you sign in with Google.</li>
        <li><strong>Profile</strong> — display name, username, bio, profile photo, genres, links to your work and any Substack link you add.</li>
        <li><strong>Writing activity</strong> — your projects, word or page counts, goals, streaks and history you log or import.</li>
        <li><strong>Social activity</strong> — posts and images you share, likes, follows, groups you join, and sprints you propose, vote on or join.</li>
        <li><strong>Messages</strong> — chats you send to other writers.</li>
        <li><strong>Support requests</strong> — anything you send us through the Contact support form.</li>
      </ul>
    ),
  },
  {
    heading: 'Information collected automatically',
    body: (
      <ul>
        <li><strong>Sign-in cookies</strong> — we use essential cookies to keep you logged in. We do not use advertising or tracking cookies.</li>
        <li><strong>Usage analytics</strong> — we use Vercel Analytics to count anonymous page views so we can see which parts of the app are used. It does not use cookies or build a profile of you across other sites.</li>
      </ul>
    ),
  },
  {
    heading: 'How we use your information',
    body: (
      <ul>
        <li>To run the app: saving your progress, showing your stats and charts, and powering the feed, chat, groups and sprints.</li>
        <li>To show your public profile and posts to other Writemates users.</li>
        <li>To respond to support requests and keep the service secure.</li>
        <li>To improve Writemates, using aggregated and anonymous usage information.</li>
      </ul>
    ),
  },
  {
    heading: 'What other people can see',
    body: (
      <p>
        Your profile, posts and public activity are visible to other Writemates users. Your private
        project details, wordcount history and account email are not shown publicly. Messages are only
        visible to the people in that conversation. Sprint scores are never shown to other people.
      </p>
    ),
  },
  {
    heading: 'What we don’t do',
    body: (
      <ul>
        <li>We don’t sell your personal information.</li>
        <li>We don’t show ads or share your data with advertisers.</li>
        <li>We don’t track you across other apps or websites.</li>
        <li>We don’t use your writing or posts to train AI models.</li>
      </ul>
    ),
  },
  {
    heading: 'Services we rely on',
    body: (
      <p>
        We use trusted providers to run Writemates: <strong>Supabase</strong> (database, sign-in and file
        storage), <strong>Vercel</strong> (hosting and anonymous analytics) and <strong>Google</strong> (if
        you choose to sign in with Google). They process data on our behalf only to provide these services,
        and may store it on servers outside your country.
      </p>
    ),
  },
  {
    heading: 'Keeping and deleting your data',
    body: (
      <p>
        We keep your information for as long as you have an account. You can edit or remove your profile
        details, projects and posts at any time in the app. You can permanently delete your
        account and all associated data yourself at any time in Settings → Delete account. If you
        can’t access your account, email hello@writemates.app and we will delete it within 30 days.
      </p>
    ),
  },
  {
    heading: 'Security',
    body: (
      <p>
        Your data is stored with access controls that limit each user to their own private information,
        and all traffic to Writemates is encrypted. No online service can be perfectly secure, but we
        take reasonable steps to protect your information.
      </p>
    ),
  },
  {
    heading: 'Children',
    body: (
      <p>
        Writemates is not intended for children under 13, and we do not knowingly collect information
        from them. If you believe a child has created an account, please contact us and we will delete it.
      </p>
    ),
  },
  {
    heading: 'Your rights',
    body: (
      <p>
        Depending on where you live, you may have the right to access, correct, export or delete your
        personal information, or to object to how it is used. To make a request, contact us using the
        details below.
      </p>
    ),
  },
  {
    heading: 'Changes to this policy',
    body: (
      <p>
        If we make meaningful changes we will update this page and the date at the top. Continuing to use
        Writemates after a change means you accept the updated policy.
      </p>
    ),
  },
  {
    heading: 'Contact us',
    body: (
      <p>
        Questions about privacy, or want your data deleted? Email us at{' '}
        <a href="mailto:hello@writemates.app" style={{ color: 'var(--color-accent)' }}>hello@writemates.app</a>{' '}
        or use the Contact support form in Settings, and we’ll get back to you.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <main
      className="max-w-2xl mx-auto px-6 py-16"
      style={{ fontFamily: 'var(--font-sans)', backgroundColor: 'var(--color-paper)' }}
    >
      <h1 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
        Privacy Policy
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
