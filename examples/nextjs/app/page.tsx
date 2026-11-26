// A Server Component: no 'use client' needed. <Captchala> is a client component and
// writes the pass token into the hidden field named by `name`, so the Server Action
// receives it with the rest of the form.
import { Captchala } from '@captcha-la/react'
import { signup } from './actions'
import { captchala } from './captchala'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<{ result?: string; error?: string }> }) {
  const { result, error } = await searchParams

  // Optional: a one-time server token, bound to this page view. Needed when the app has
  // "server token required" enabled in the dashboard.
  const issue = await captchala.issueServerToken('signup', { ttl: 300 })

  return (
    <main>
      <h1>Sign up</h1>
      {result && (
        <p id="result" data-result={result}>
          {result === 'ok' ? 'Verification passed.' : `Verification failed: ${error || result}`}
        </p>
      )}
      <form action={signup} style={{ display: 'grid', gap: 12 }}>
        <input name="email" type="email" placeholder="you@example.com" required />
        <Captchala
          appKey={process.env.NEXT_PUBLIC_CAPTCHALA_APP_KEY!}
          product="embed"
          action="signup"
          serverToken={issue.token ?? undefined}
          name="captchala_token"
        />
        <button type="submit">Create account</button>
      </form>
    </main>
  )
}
