# @captcha-la/react

[English](https://github.com/Captcha-La/react/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/react/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/react/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/react/blob/main/README.ko.md) · **Español** · [Português (BR)](https://github.com/Captcha-La/react/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/react/blob/main/README.de.md)

Componente oficial de React para el CAPTCHA de Captchala: protección CAPTCHA inteligente para tus aplicaciones React.

[![npm version](https://img.shields.io/npm/v/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![license](https://img.shields.io/npm/l/@captcha-la/react.svg)](https://github.com/Captcha-La/react/blob/main/LICENSE)

## Instalación

```bash
npm install @captcha-la/react
# or
yarn add @captcha-la/react
# or
pnpm add @captcha-la/react
```

## Inicio rápido

### Con el componente

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

### Con el hook

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

| Prop | Tipo | Valor por defecto | Descripción |
|------|------|---------|-------------|
| `appKey` | `string` | *obligatorio* | La clave de tu aplicación de Captchala |
| `serverToken` | `string` | - | Token de desafío de un solo uso emitido por el servidor. Obligatorio cuando la aplicación tiene `server_token_required=true`. Consulta [Producción: modo serverToken](#production-using-servertoken) más abajo. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Modo de visualización |
| `action` | `string` | `'default'` | Identificador de la acción (p. ej., 'login', 'register', 'checkout') |
| `lang` | `string` | idioma del navegador | Código de idioma (`'zh-CN'`, `'en'`, `'ja'`, etc.); si no se indica, se usa el idioma del navegador |
| `onSuccess` | `(result) => void` | - | Callback de éxito |
| `onExpired` | `() => void` | - | El pass token caducó antes de usarse (se dispara una vez, en lugar de `onError`; el widget muestra la caducidad). Consulta [Caducidad del token](#token-expiry) |
| `onError` | `(error) => void` | - | Callback de error |
| `onClose` | `() => void` | - | Callback de cierre |
| `onReady` | `() => void` | - | Callback de listo |
| `name` | `string` | - | Nombre del campo del formulario. Si se indica, un input oculto con este nombre guarda el pass token (se vacía al reiniciar, al caducar y en caso de error), de modo que un envío de formulario normal o una Server Action de Next.js lo recibe. Consulta [Next.js](#nextjs) |
| `className` | `string` | - | Clase CSS del contenedor |
| `style` | `CSSProperties` | - | Estilos en línea del contenedor |

## Métodos (mediante ref)

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

| Método | Descripción |
|--------|-------------|
| `verify()` | Inicia la verificación |
| `reset()` | Reinicia el estado del CAPTCHA |
| `destroy()` | Destruye la instancia del CAPTCHA |
| `bindTo(selector)` | Lo vincula a un elemento (para el modo 'bind') |

## Hook useCaptchala

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
## Caducidad del token

El pass token que recibes en `onSuccess` tiene una validez limitada. Si el usuario tarda demasiado en enviar
el formulario, el widget indica que la verificación caducó (la barra o la casilla piden verificar de nuevo; en
modo `bind` no se muestra nada, porque el botón es tuyo) y `onExpired` se dispara una vez, en lugar de `onError`.
Tú decides qué más ocurre; por ejemplo, mostrar tu propio mensaje y llamar a `reset()` y después a `verify()`
para iniciar una nueva verificación (el mismo patrón que `expired-callback` + `reset()` + `execute()` en otros
widgets CAPTCHA):

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

Sin `onExpired`, `onError` se dispara una vez (clase `expired`), como hasta ahora.
`onExpired` nunca se dispara con tokens offline o degradados. `useCaptchala({ onExpired })`
funciona de la misma manera.

## Modos de visualización

### Modo Popup (por defecto)
Muestra un botón que abre un diálogo emergente con el CAPTCHA.

```tsx
<Captchala appKey="your-key" product="popup" />
```

### Modo Float
Muestra un widget CAPTCHA flotante en línea.

```tsx
<Captchala appKey="your-key" product="float" />
```

### Modo Embed
Inserta el CAPTCHA directamente en la página.

```tsx
<Captchala appKey="your-key" product="embed" />
```

### Modo Bind con el hook
Ideal para envíos de formularios: verifica cuando el usuario envía.

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
## Producción: uso de `serverToken`

En producción (inicio de sesión, registro, pagos, etc.) recomendamos el **flujo con token emitido por el
servidor**. Tu backend guarda el secreto de la aplicación, llama a `POST /v1/server/challenge/issue` con
`X-App-Key` + `X-App-Secret` para generar un `server_token` de un solo uso (TTL de 5 minutos) y se lo entrega
al navegador. Después, el navegador renderiza el widget con `serverToken`:

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

Ejemplo de endpoint en el backend (Express / Node.js):

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

Notas:
- Nunca incluyas `X-App-Secret` en el código del navegador.
- Cada `server_token` se puede usar exactamente una vez. Genera uno nuevo antes de cada montaje del widget.
- Las aplicaciones antiguas con `server_token_required=false` pueden seguir usando el flujo público solo con `appKey`.

## Validación en el servidor

Después de recibir el token en `onSuccess`, valídalo en tu servidor:

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

El paquete funciona con App Router y con Pages Router. Sus componentes y hooks están marcados con
`'use client'`, así que puedes renderizar `<Captchala>` directamente en una página que sea un Server Component.

Los Server Components no pueden pasar callbacks como `onSuccess`. En su lugar, define `name`: el token se guarda
en un campo oculto del formulario, y una Server Action lo lee de los datos del formulario y lo valida en el
servidor, aquí con [`@captcha-la/node`](https://www.npmjs.com/package/@captcha-la/node):

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

- **Server token:** un Server Component puede emitirlo durante el renderizado y pasarlo directamente al widget:
  `const issue = await captchala.issueServerToken('signup', { ttl: 300 })` y después
  `serverToken={issue.token ?? undefined}`.
- **Callbacks** (`onSuccess`, `ref.verify()`, `useCaptchala`) requieren un Client Component: colócalos en un
  archivo que empiece por `'use client'`, como en cualquier aplicación React.
- **Pages Router:** usa el componente como en cualquier aplicación React y valida en una API route.
- Tienes un ejemplo completo con App Router, que usa las claves de prueba públicas, en
  [`examples/nextjs`](https://github.com/Captcha-La/react/tree/main/examples/nextjs).

## Soporte para TypeScript

Incluye soporte completo para TypeScript:

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

## Licencia

Licencia MIT: consulta [LICENSE](./LICENSE) para más detalles.

## Enlaces

- [Sitio web](https://captcha.la)
- [Documentación](https://docs.captcha.la/sdk/react)
- [Panel de control](https://dash.captcha.la)
