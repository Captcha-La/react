# @captcha-la/react

[English](https://github.com/Captcha-La/react/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/react/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/react/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/react/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/react/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/react/blob/main/README.pt-BR.md) · **Deutsch**

Offizielle React-Komponente für das Captchala-CAPTCHA: intelligenter CAPTCHA-Schutz für Ihre React-Anwendungen.

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

## Schnellstart

### Als Komponente

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

### Als Hook

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

| Prop | Typ | Standard | Beschreibung |
|------|------|---------|-------------|
| `appKey` | `string` | *erforderlich* | Ihr Captchala-Anwendungsschlüssel |
| `serverToken` | `string` | - | Einmaliges, vom Server ausgestelltes Challenge-Token. Erforderlich, wenn für die App `server_token_required=true` gesetzt ist. Siehe [Produktion: serverToken-Modus](#production-using-servertoken) weiter unten. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Anzeigemodus |
| `action` | `string` | `'default'` | Aktionskennung (z. B. 'login', 'register', 'checkout') |
| `lang` | `string` | Browsersprache | Sprachcode (`'zh-CN'`, `'en'`, `'ja'` usw.); ohne Angabe gilt die Browsersprache |
| `onSuccess` | `(result) => void` | - | Callback bei Erfolg |
| `onExpired` | `() => void` | - | Der pass token ist abgelaufen, bevor er verwendet wurde (wird einmal statt `onError` ausgelöst; das Widget zeigt den Ablauf an). Siehe [Ablauf des Tokens](#token-expiry) |
| `onError` | `(error) => void` | - | Callback bei Fehler |
| `onClose` | `() => void` | - | Callback beim Schließen |
| `onReady` | `() => void` | - | Callback, sobald bereit |
| `name` | `string` | - | Name des Formularfelds. Ist er gesetzt, enthält ein verstecktes Input-Feld mit diesem Namen den pass token (bei Reset, Ablauf und Fehler geleert), sodass ein normaler Formularversand oder eine Next.js Server Action ihn erhält. Siehe [Next.js](#nextjs) |
| `className` | `string` | - | Klassenname des Containers |
| `style` | `CSSProperties` | - | Inline-Styles des Containers |

## Methoden (über ref)

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

| Methode | Beschreibung |
|--------|-------------|
| `verify()` | Startet die Verifizierung |
| `reset()` | Setzt den CAPTCHA-Zustand zurück |
| `destroy()` | Zerstört die CAPTCHA-Instanz |
| `bindTo(selector)` | Bindet an ein Element (für den Modus 'bind') |

## useCaptchala-Hook

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

<a id="token-expiry"></a>
## Ablauf des Tokens

Der pass token aus `onSuccess` ist nur begrenzt gültig. Wartet der Nutzer zu lange mit dem Absenden, zeigt
das Widget an, dass die Verifizierung abgelaufen ist (Leiste oder Checkbox fordern zur erneuten Verifizierung
auf; im Modus `bind` wird nichts angezeigt, da der Button Ihnen gehört), und `onExpired` wird einmal ausgelöst,
statt `onError`. Was sonst passiert, entscheiden Sie, zum Beispiel eine eigene Meldung anzeigen und `reset()`
und danach `verify()` aufrufen, um eine neue Verifizierung zu starten (dasselbe Muster wie `expired-callback` +
`reset()` + `execute()` bei anderen CAPTCHA-Widgets):

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

Ohne `onExpired` wird wie bisher einmal `onError` ausgelöst (Klasse `expired`).
Bei Offline- oder Degraded-Tokens wird `onExpired` nie ausgelöst. `useCaptchala({ onExpired })`
funktioniert genauso.

## Anzeigemodi

### Popup-Modus (Standard)
Zeigt einen Button, der einen CAPTCHA-Popup-Dialog öffnet.

```tsx
<Captchala appKey="your-key" product="popup" />
```

### Float-Modus
Zeigt ein schwebendes Inline-CAPTCHA-Widget an.

```tsx
<Captchala appKey="your-key" product="float" />
```

### Embed-Modus
Bettet das CAPTCHA direkt in die Seite ein.

```tsx
<Captchala appKey="your-key" product="embed" />
```

### Bind-Modus mit Hook
Ideal für Formulare: Die Verifizierung erfolgt beim Absenden.

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

<a id="production-using-servertoken"></a>
## Produktion: `serverToken` verwenden

Für die Produktion (Login, Registrierung, Zahlung usw.) empfehlen wir den **Ablauf mit serverseitig
ausgestelltem Token**. Ihr Backend verwahrt das App-Secret, ruft `POST /v1/server/challenge/issue` mit
`X-App-Key` + `X-App-Secret` auf, um ein einmaliges `server_token` (TTL 5 Minuten) zu erzeugen, und übergibt
dieses Token an den Browser. Der Browser rendert das Widget dann mit `serverToken`:

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

Beispiel für einen Backend-Endpunkt (Express / Node.js):

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

Hinweise:
- Betten Sie `X-App-Secret` niemals in Browser-Code ein.
- Jedes `server_token` kann genau einmal verwendet werden. Erzeugen Sie vor jedem Mounten des Widgets ein neues.
- Ältere Apps mit `server_token_required=false` können weiterhin den öffentlichen Ablauf nur mit `appKey` nutzen.

## Serverseitige Validierung

Nachdem Sie das Token in `onSuccess` erhalten haben, validieren Sie es auf Ihrem Server:

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

Das Paket funktioniert mit dem App Router und dem Pages Router. Seine Komponenten und Hooks sind mit
`'use client'` markiert, sodass Sie `<Captchala>` direkt in einer Server-Component-Seite rendern können.

Server Components können keine Callbacks wie `onSuccess` übergeben. Setzen Sie stattdessen `name`: Das Token
landet in einem versteckten Formularfeld, und eine Server Action liest es aus den Formulardaten und validiert es
auf dem Server, hier mit [`@captcha-la/node`](https://www.npmjs.com/package/@captcha-la/node):

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

- **Server token:** Eine Server Component kann es beim Rendern ausstellen und direkt an das Widget übergeben:
  `const issue = await captchala.issueServerToken('signup', { ttl: 300 })`, dann
  `serverToken={issue.token ?? undefined}`.
- **Callbacks** (`onSuccess`, `ref.verify()`, `useCaptchala`) benötigen eine Client Component: Legen Sie sie
  wie in jeder React-App in eine Datei, die mit `'use client'` beginnt.
- **Pages Router:** Verwenden Sie die Komponente wie in jeder React-App und validieren Sie in einer API-Route.
- Ein vollständiges App-Router-Beispiel mit den öffentlichen Testschlüsseln finden Sie unter
  [`examples/nextjs`](https://github.com/Captcha-La/react/tree/main/examples/nextjs).

## TypeScript-Unterstützung

Vollständige TypeScript-Unterstützung ist enthalten:

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

## Lizenz

MIT-Lizenz – Details siehe [LICENSE](./LICENSE).

## Links

- [Website](https://captcha.la)
- [Dokumentation](https://docs.captcha.la/sdk/react)
- [Dashboard](https://dash.captcha.la)
