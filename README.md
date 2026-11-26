# @captcha-la/react

[English](./README.md) · [简体中文](./README.zh-CN.md)

Official Captchala CAPTCHA React component - Smart CAPTCHA protection for your React applications.

[![npm version](https://img.shields.io/npm/v/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![license](https://img.shields.io/npm/l/@captcha-la/react.svg)](https://github.com/Captcha-La/react/blob/main/LICENSE)

## Installation

```bash
npm install @captcha-la/react
# or
yarn add @captcha-la/react
# or
pnpm add @captcha-la/react
```

## Quick Start

### Component Approach

```tsx
import { Captchala } from '@captcha-la/react'

function App() {
  const handleSuccess = (result) => {
    console.log('Verification successful!')
    console.log('Token:', result.token)
    // Send token to your server for validation
  }

  return (
    <Captchala
      appKey="your-app-key"
      product="popup"
      onSuccess={handleSuccess}
      onError={(err) => console.error(err)}
    />
  )
}
```

### Hook Approach

```tsx
import { useCaptchala } from '@captcha-la/react'

function LoginForm() {
  const { ready, verify } = useCaptchala({
    appKey: 'your-app-key',
    product: 'bind',
    action: 'login'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const result = await verify()
      console.log('Token:', result.token)
      // Continue with form submission
    } catch (err) {
      console.error('Verification failed:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button type="submit" disabled={!ready}>
        Login
      </button>
    </form>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appKey` | `string` | *required* | Your Captchala application key |
| `serverToken` | `string` | - | One-time, server-issued challenge token. Required when the app has `server_token_required=true`. See [Production: serverToken mode](#production-using-servertoken) below. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Display mode |
| `action` | `string` | `'default'` | Action identifier (e.g., 'login', 'register', 'checkout') |
| `lang` | `string` | browser language | Language code (`'zh-CN'`, `'en'`, `'ja'`, etc.); unset = the browser language |
| `onSuccess` | `(result) => void` | - | Success callback |
| `onExpired` | `() => void` | - | The pass token expired before it was used (fires once, instead of `onError`; the widget shows the expiry). See [Token expiry](#token-expiry) |
| `onError` | `(error) => void` | - | Error callback |
| `onClose` | `() => void` | - | Close callback |
| `onReady` | `() => void` | - | Ready callback |
| `name` | `string` | - | Form field name. When set, a hidden input with this name holds the pass token (emptied on reset, expiry and error), so a plain form submit or a Next.js Server Action receives it. See [Next.js](#nextjs) |
| `className` | `string` | - | Container class name |
| `style` | `CSSProperties` | - | Container inline styles |

## Methods (via ref)

```tsx
import { useRef } from 'react'
import { Captchala, CaptchalaRef } from '@captcha-la/react'

function App() {
  const captchaRef = useRef<CaptchalaRef>(null)

  const handleManualVerify = () => {
    captchaRef.current?.verify()
  }

  return (
    <>
      <Captchala ref={captchaRef} appKey="your-key" />
      <button onClick={handleManualVerify}>Verify</button>
    </>
  )
}
```

| Method | Description |
|--------|-------------|
| `verify()` | Trigger verification |
| `reset()` | Reset CAPTCHA state |
| `destroy()` | Destroy CAPTCHA instance |
| `bindTo(selector)` | Bind to element (for 'bind' mode) |

## useCaptchala Hook

```tsx
const {
  ready,      // boolean - SDK is loaded and ready
  loading,    // boolean - SDK is loading
  error,      // Error | null - Loading error
  verify,     // () => Promise<CaptchalaResult> - Trigger verification
  reset,      // () => void - Reset state
  bindTo,     // (selector) => void - Bind to element
  appendTo    // (selector) => void - Append to element
} = useCaptchala(options)
```

## Token expiry

The pass token from `onSuccess` is valid for a limited time. If the user waits too
long before submitting, the widget shows that the verification expired (the bar
or checkbox asks to verify again; in `bind` mode nothing is shown, since the
button is yours) and `onExpired` fires once, instead of `onError`. You decide what
else happens, for example show your own message and call `reset()` then `verify()`
to start a new verification (the same pattern as an `expired-callback` +
`reset()` + `execute()` in other CAPTCHA widgets):

```tsx
const captchaRef = useRef<CaptchalaRef>(null)
const [token, setToken] = useState('')
const [expired, setExpired] = useState(false)

const verifyAgain = () => {
  setExpired(false)
  captchaRef.current?.reset()
  captchaRef.current?.verify()
}

<Captchala
  ref={captchaRef}
  appKey="your-app-key"
  onSuccess={(r) => { setToken(r.token); setExpired(false) }}
  onExpired={() => { setToken(''); setExpired(true) }}
/>
{expired && <p>Token expired. <button onClick={verifyAgain}>Verify again</button></p>}
```

Without `onExpired`, `onError` fires once (class `expired`), as before.
`onExpired` never fires for offline or degraded tokens. `useCaptchala({ onExpired })`
works the same way.

## Display Modes

### Popup Mode (Default)
Shows a button that triggers a popup CAPTCHA dialog.

```tsx
<Captchala appKey="your-key" product="popup" />
```

### Float Mode
Displays an inline floating CAPTCHA widget.

```tsx
<Captchala appKey="your-key" product="float" />
```

### Embed Mode
Embeds the CAPTCHA directly in the page.

```tsx
<Captchala appKey="your-key" product="embed" />
```

### Bind Mode with Hook
Best for form submissions - verifies when the user submits.

```tsx
function Form() {
  const { ready, verify } = useCaptchala({
    appKey: 'your-key',
    product: 'bind'
  })

  const handleSubmit = async () => {
    const result = await verify()
    // result.token contains the verification token
  }

  return <button onClick={handleSubmit} disabled={!ready}>Submit</button>
}
```

## Production: using `serverToken`

For production (login, registration, payment, etc.) we recommend the
**server-issued token flow**. Your backend holds the app secret, calls
`POST /v1/server/challenge/issue` with `X-App-Key` + `X-App-Secret` to mint a
one-time `server_token` (5-minute TTL), and hands that token to the browser.
The browser then renders the widget with `serverToken`:

```tsx
import { useState, useEffect } from 'react'
import { Captchala } from '@captcha-la/react'

function LoginPage() {
  const [serverToken, setServerToken] = useState<string>()

  useEffect(() => {
    // Your own backend endpoint that proxies /v1/server/challenge/issue
    fetch('/api/captcha-token')
      .then(r => r.json())
      .then(d => setServerToken(d.server_token))
      .catch(console.error)
  }, [])

  if (!serverToken) return <div>Loading...</div>

  return (
    <Captchala
      serverToken={serverToken}
      appKey="pk_your_public_app_key"
      action="login"
      onSuccess={(r) => console.log('pass_token:', r.token)}
    />
  )
}
```

Example backend endpoint (Express / Node.js):

```js
// server.js — call this from your own /api/captcha-token handler
app.get('/api/captcha-token', async (req, res) => {
  const r = await fetch('https://verify.captcha.la/v1/server/challenge/issue', {
    method: 'POST',
    headers: {
      'X-App-Key': process.env.CAPTCHALA_APP_KEY,
      'X-App-Secret': process.env.CAPTCHALA_APP_SECRET,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'action=login&ttl=300'
  })
  const { data } = await r.json()
  res.json({ server_token: data.server_token })
})
```

Notes:
- Never embed `X-App-Secret` in browser code.
- Each `server_token` can be used exactly once. Regenerate before every widget mount.
- Legacy apps with `server_token_required=false` can still use the public `appKey`-only flow.

## Server-side Validation

After receiving the token from `onSuccess`, validate it on your server:

```js
// Your backend
const response = await fetch('https://verify.captcha.la/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Key': process.env.CAPTCHALA_APP_KEY,
    'X-App-Secret': process.env.CAPTCHALA_APP_SECRET
  },
  // pass_token = result.token from onSuccess; client_ip is optional but recommended
  body: JSON.stringify({ pass_token: token, client_ip: req.ip })
})

const result = await response.json()
if (result.code === 0 && result.data.valid === true) {
  // Token is valid, proceed with the request
}
```

## Next.js

The package works with the App Router and the Pages Router. Its components and hooks are marked
`'use client'`, so you can render `<Captchala>` directly in a Server Component page.

Server Components cannot pass callbacks such as `onSuccess`. Set `name` instead: the token goes into
a hidden form field, and a Server Action reads it from the form data and validates it on the server,
here with [`@captcha-la/node`](https://www.npmjs.com/package/@captcha-la/node):

```tsx
// app/signup/page.tsx (Server Component)
import { Captchala } from '@captcha-la/react'
import { signup } from './actions'

export default function Page() {
  return (
    <form action={signup}>
      <input name="email" type="email" required />
      <Captchala
        appKey={process.env.NEXT_PUBLIC_CAPTCHALA_APP_KEY!}
        product="embed"
        action="signup"
        name="captchala_token"
      />
      <button type="submit">Create account</button>
    </form>
  )
}
```

```ts
// app/signup/actions.ts
'use server'
import { headers } from 'next/headers'
import { CaptchaLaClient } from '@captcha-la/node'

const captchala = new CaptchaLaClient() // CAPTCHALA_APP_KEY / CAPTCHALA_APP_SECRET

export async function signup(formData: FormData) {
  const token = String(formData.get('captchala_token') ?? '')
  const clientIp = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim()
  const result = await captchala.validate(token, { clientIp, expectedAction: 'signup' })
  if (!result.valid) {
    // reject: result.error says why
    return
  }
  // create the account
}
```

- **Server token:** a Server Component can issue it while rendering and pass it straight to the widget:
  `const issue = await captchala.issueServerToken('signup', { ttl: 300 })`, then
  `serverToken={issue.token ?? undefined}`.
- **Callbacks** (`onSuccess`, `ref.verify()`, `useCaptchala`) need a Client Component: put them in a
  file that starts with `'use client'`, as in any React app.
- **Pages Router:** use the component as in any React app and validate in an API route.
- A complete App Router example, using the public test keys, is in
  [`examples/nextjs`](https://github.com/Captcha-La/react/tree/main/examples/nextjs).

## TypeScript Support

Full TypeScript support is included:

```ts
import {
  Captchala,
  useCaptchala,
  type CaptchalaProps,
  type CaptchalaResult,
  type CaptchalaRef,
  type UseCaptchalaOptions
} from '@captcha-la/react'
```

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Links

- [Website](https://captcha.la)
- [Documentation](https://docs.captcha.la/sdk/react)
- [Dashboard](https://dash.captcha.la)
