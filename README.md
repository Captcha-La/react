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
| `lang` | `string` | `'zh-CN'` | Language code (`'zh-CN'`, `'en'`, `'ja'`, etc.) |
| `onSuccess` | `(result) => void` | - | Success callback |
| `onExpired` | `() => void` | - | The pass token expired before it was used (fires once). See [Token expiry](#token-expiry) |
| `onError` | `(error) => void` | - | Error callback |
| `onClose` | `() => void` | - | Close callback |
| `onReady` | `() => void` | - | Ready callback |
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
long before submitting, `onExpired` fires once. With `onExpired` the widget stays
as it is and `onError` does not fire: you decide what happens, for example show a
message and call `reset()` then `verify()` to start a new verification (the same
pattern as an `expired-callback` + `reset()` + `execute()` in other CAPTCHA widgets):

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

Without `onExpired`, nothing changes from before: the bar shows "Verification
expired" with a refresh button and `onError` fires once (class `expired`).
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
  const r = await fetch('https://apiv1.captcha.la/v1/server/challenge/issue', {
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
const response = await fetch('https://api.captcha.la/v1/risk/consume', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Key': 'your-app-key',
    'X-App-Secret': 'your-app-secret'
  },
  body: JSON.stringify({ token })
})

const result = await response.json()
if (result.code === 0 && result.data.valid) {
  // Token is valid, proceed with the request
}
```

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
- [Documentation](https://docs.captcha.la/sdk/web/react)
- [Dashboard](https://dash.captcha.la)
