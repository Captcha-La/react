# @captcha-la/react

[English](https://github.com/Captcha-La/react/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/react/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/react/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/react/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/react/blob/main/README.es.md) · **Português (BR)** · [Deutsch](https://github.com/Captcha-La/react/blob/main/README.de.md)

Componente React oficial do CAPTCHA Captchala: proteção CAPTCHA inteligente para suas aplicações React.

[![npm version](https://img.shields.io/npm/v/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![license](https://img.shields.io/npm/l/@captcha-la/react.svg)](https://github.com/Captcha-La/react/blob/main/LICENSE)

## Instalação

```bash
npm install @captcha-la/react
# or
yarn add @captcha-la/react
# or
pnpm add @captcha-la/react
```

## Início rápido

### Usando o componente

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

### Usando o hook

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

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-------------|
| `appKey` | `string` | *obrigatório* | A chave da sua aplicação Captchala |
| `serverToken` | `string` | - | Token de desafio de uso único emitido pelo servidor. Obrigatório quando a aplicação tem `server_token_required=true`. Veja [Produção: modo serverToken](#production-using-servertoken) abaixo. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Modo de exibição |
| `action` | `string` | `'default'` | Identificador da ação (ex.: 'login', 'register', 'checkout') |
| `lang` | `string` | idioma do navegador | Código de idioma (`'zh-CN'`, `'en'`, `'ja'` etc.); sem valor, usa o idioma do navegador |
| `onSuccess` | `(result) => void` | - | Callback de sucesso |
| `onExpired` | `() => void` | - | O pass token expirou antes de ser usado (dispara uma vez, no lugar de `onError`; o widget mostra a expiração). Veja [Expiração do token](#token-expiry) |
| `onError` | `(error) => void` | - | Callback de erro |
| `onClose` | `() => void` | - | Callback de fechamento |
| `onReady` | `() => void` | - | Callback de pronto |
| `name` | `string` | - | Nome do campo do formulário. Quando definido, um input oculto com esse nome guarda o pass token (esvaziado ao resetar, ao expirar e em caso de erro), assim um envio de formulário comum ou uma Server Action do Next.js o recebe. Veja [Next.js](#nextjs) |
| `className` | `string` | - | Nome da classe do contêiner |
| `style` | `CSSProperties` | - | Estilos inline do contêiner |

## Métodos (via ref)

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

| Método | Descrição |
|--------|-------------|
| `verify()` | Inicia a verificação |
| `reset()` | Redefine o estado do CAPTCHA |
| `destroy()` | Destrói a instância do CAPTCHA |
| `bindTo(selector)` | Vincula a um elemento (para o modo 'bind') |

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
## Expiração do token

O pass token recebido em `onSuccess` é válido por tempo limitado. Se o usuário demorar demais para enviar,
o widget mostra que a verificação expirou (a barra ou a caixa de seleção pede uma nova verificação; no modo
`bind` nada é exibido, já que o botão é seu) e `onExpired` dispara uma vez, no lugar de `onError`. Você decide
o que mais acontece; por exemplo, mostrar sua própria mensagem e chamar `reset()` e depois `verify()` para
iniciar uma nova verificação (o mesmo padrão de `expired-callback` + `reset()` + `execute()` em outros widgets
de CAPTCHA):

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

Sem `onExpired`, `onError` dispara uma vez (classe `expired`), como antes.
`onExpired` nunca dispara para tokens offline ou degradados. `useCaptchala({ onExpired })`
funciona da mesma forma.

## Modos de exibição

### Modo Popup (padrão)
Mostra um botão que abre uma janela pop-up com o CAPTCHA.

```tsx
<Captchala appKey="your-key" product="popup" />
```

### Modo Float
Exibe um widget CAPTCHA flutuante inline.

```tsx
<Captchala appKey="your-key" product="float" />
```

### Modo Embed
Incorpora o CAPTCHA diretamente na página.

```tsx
<Captchala appKey="your-key" product="embed" />
```

### Modo Bind com o hook
Ideal para envio de formulários: verifica quando o usuário envia.

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
## Produção: usando `serverToken`

Em produção (login, cadastro, pagamento etc.) recomendamos o **fluxo com token emitido pelo servidor**.
Seu backend guarda o secret da aplicação, chama `POST /v1/server/challenge/issue` com `X-App-Key` +
`X-App-Secret` para gerar um `server_token` de uso único (TTL de 5 minutos) e entrega esse token ao navegador.
O navegador então renderiza o widget com `serverToken`:

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

Exemplo de endpoint no backend (Express / Node.js):

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

Observações:
- Nunca inclua `X-App-Secret` no código do navegador.
- Cada `server_token` pode ser usado exatamente uma vez. Gere um novo antes de cada montagem do widget.
- Aplicações antigas com `server_token_required=false` ainda podem usar o fluxo público apenas com `appKey`.

## Validação no servidor

Depois de receber o token em `onSuccess`, valide-o no seu servidor:

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

O pacote funciona com o App Router e com o Pages Router. Seus componentes e hooks são marcados com
`'use client'`, então você pode renderizar `<Captchala>` diretamente em uma página que seja Server Component.

Server Components não podem passar callbacks como `onSuccess`. Em vez disso, defina `name`: o token vai para
um campo oculto do formulário, e uma Server Action o lê dos dados do formulário e o valida no servidor, aqui
com [`@captcha-la/node`](https://www.npmjs.com/package/@captcha-la/node):

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

- **Server token:** um Server Component pode emiti-lo durante a renderização e passá-lo direto para o widget:
  `const issue = await captchala.issueServerToken('signup', { ttl: 300 })` e depois
  `serverToken={issue.token ?? undefined}`.
- **Callbacks** (`onSuccess`, `ref.verify()`, `useCaptchala`) exigem um Client Component: coloque-os em um
  arquivo que comece com `'use client'`, como em qualquer aplicação React.
- **Pages Router:** use o componente como em qualquer aplicação React e valide em uma API route.
- Um exemplo completo com App Router, usando as chaves de teste públicas, está em
  [`examples/nextjs`](https://github.com/Captcha-La/react/tree/main/examples/nextjs).

## Suporte a TypeScript

Inclui suporte completo a TypeScript:

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

## Licença

Licença MIT: veja [LICENSE](./LICENSE) para mais detalhes.

## Links

- [Site](https://captcha.la)
- [Documentação](https://docs.captcha.la/sdk/react)
- [Painel](https://dash.captcha.la)
