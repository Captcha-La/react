# @captcha-la/react

[English](https://github.com/Captcha-La/react/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/react/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/react/blob/main/README.ja.md) · **한국어** · [Español](https://github.com/Captcha-La/react/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/react/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/react/blob/main/README.de.md)

Captchala CAPTCHA 공식 React 컴포넌트 - React 애플리케이션을 위한 스마트한 CAPTCHA 보호.

[![npm version](https://img.shields.io/npm/v/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![license](https://img.shields.io/npm/l/@captcha-la/react.svg)](https://github.com/Captcha-La/react/blob/main/LICENSE)

## 설치

```bash
npm install @captcha-la/react
# or
yarn add @captcha-la/react
# or
pnpm add @captcha-la/react
```

## 빠른 시작

### 컴포넌트 방식

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

### Hook 방식

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

| Prop | 타입 | 기본값 | 설명 |
|------|------|---------|-------------|
| `appKey` | `string` | *필수* | Captchala 애플리케이션 키 |
| `serverToken` | `string` | - | 서버에서 발급하는 일회용 챌린지 토큰. 앱에 `server_token_required=true`가 설정된 경우 필수입니다. 아래 [프로덕션: serverToken 모드](#production-using-servertoken)를 참고하세요. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 표시 모드 |
| `action` | `string` | `'default'` | 액션 식별자 (예: 'login', 'register', 'checkout') |
| `lang` | `string` | 브라우저 언어 | 언어 코드 (`'zh-CN'`, `'en'`, `'ja'` 등). 지정하지 않으면 브라우저 언어 |
| `onSuccess` | `(result) => void` | - | 성공 콜백 |
| `onExpired` | `() => void` | - | pass token이 사용되기 전에 만료됨 (`onError` 대신 한 번만 호출되며, 위젯에 만료가 표시됩니다). [토큰 만료](#token-expiry) 참고 |
| `onError` | `(error) => void` | - | 오류 콜백 |
| `onClose` | `() => void` | - | 닫기 콜백 |
| `onReady` | `() => void` | - | 준비 완료 콜백 |
| `name` | `string` | - | 폼 필드 이름. 지정하면 이 이름의 hidden input에 pass token이 담깁니다 (리셋, 만료, 오류 시 비워짐). 일반 폼 제출이나 Next.js Server Action에서 그대로 받을 수 있습니다. [Next.js](#nextjs) 참고 |
| `className` | `string` | - | 컨테이너 클래스 이름 |
| `style` | `CSSProperties` | - | 컨테이너 인라인 스타일 |

## 메서드 (ref 사용)

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

| 메서드 | 설명 |
|--------|-------------|
| `verify()` | 검증 시작 |
| `reset()` | CAPTCHA 상태 초기화 |
| `destroy()` | CAPTCHA 인스턴스 제거 |
| `bindTo(selector)` | 요소에 바인딩 ('bind' 모드용) |

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

<a id="token-expiry"></a>
## 토큰 만료

`onSuccess`로 받은 pass token은 유효 시간이 정해져 있습니다. 사용자가 제출하기까지 너무 오래 기다리면
위젯에 검증이 만료되었다고 표시되고 (바 또는 체크박스가 다시 검증하도록 안내합니다. `bind` 모드에서는
버튼을 직접 만들기 때문에 아무것도 표시되지 않습니다) `onError` 대신 `onExpired`가 한 번 호출됩니다.
그다음 동작은 직접 정하면 됩니다. 예를 들어 자체 메시지를 보여 주고 `reset()`, `verify()`를 차례로 호출해
새 검증을 시작할 수 있습니다 (다른 CAPTCHA 위젯의 `expired-callback` + `reset()` + `execute()`와 같은
패턴입니다):

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

`onExpired`가 없으면 이전과 같이 `onError`가 한 번 호출됩니다 (클래스 `expired`).
오프라인 토큰이나 성능 저하(degraded) 모드 토큰에서는 `onExpired`가 호출되지 않습니다. `useCaptchala({ onExpired })`도
같은 방식으로 동작합니다.

## 표시 모드

### Popup 모드 (기본값)
버튼을 표시하고, 버튼을 누르면 CAPTCHA 팝업 대화상자가 열립니다.

```tsx
<Captchala appKey="your-key" product="popup" />
```

### Float 모드
인라인 플로팅 CAPTCHA 위젯을 표시합니다.

```tsx
<Captchala appKey="your-key" product="float" />
```

### Embed 모드
CAPTCHA를 페이지에 직접 삽입합니다.

```tsx
<Captchala appKey="your-key" product="embed" />
```

### Bind 모드 (Hook 사용)
폼 제출에 가장 적합합니다. 사용자가 제출할 때 검증합니다.

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
## 프로덕션: `serverToken` 사용

프로덕션 환경(로그인, 회원가입, 결제 등)에서는 **서버 발급 토큰 흐름**을 권장합니다.
백엔드가 앱 시크릿을 보관하고, `X-App-Key` + `X-App-Secret`으로 `POST /v1/server/challenge/issue`를
호출해 일회용 `server_token`(TTL 5분)을 발급한 뒤 브라우저에 전달합니다.
그러면 브라우저는 `serverToken`으로 위젯을 렌더링합니다:

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

백엔드 엔드포인트 예시 (Express / Node.js):

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

참고:
- `X-App-Secret`을 브라우저 코드에 절대 포함하지 마세요.
- 각 `server_token`은 정확히 한 번만 사용할 수 있습니다. 위젯을 마운트할 때마다 새로 발급하세요.
- `server_token_required=false`인 기존 앱은 공개 `appKey`만 사용하는 흐름을 계속 쓸 수 있습니다.

## 서버 측 검증

`onSuccess`에서 토큰을 받은 후 서버에서 검증하세요:

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

이 패키지는 App Router와 Pages Router 모두에서 동작합니다. 컴포넌트와 Hook에는 `'use client'`가
지정되어 있으므로 Server Component 페이지에서 `<Captchala>`를 바로 렌더링할 수 있습니다.

Server Component는 `onSuccess` 같은 콜백을 전달할 수 없습니다. 대신 `name`을 지정하세요. 토큰이
hidden 폼 필드에 들어가고, Server Action이 폼 데이터에서 이를 읽어 서버에서 검증합니다. 여기서는
[`@captcha-la/node`](https://www.npmjs.com/package/@captcha-la/node)를 사용합니다:

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

- **Server token:** Server Component는 렌더링 중에 토큰을 발급해 위젯에 바로 전달할 수 있습니다:
  `const issue = await captchala.issueServerToken('signup', { ttl: 300 })` 후
  `serverToken={issue.token ?? undefined}`.
- **콜백**(`onSuccess`, `ref.verify()`, `useCaptchala`)에는 Client Component가 필요합니다. 일반
  React 앱처럼 `'use client'`로 시작하는 파일에 작성하세요.
- **Pages Router:** 일반 React 앱처럼 컴포넌트를 사용하고 API 라우트에서 검증하세요.
- 공개 테스트 키를 사용하는 완전한 App Router 예제는
  [`examples/nextjs`](https://github.com/Captcha-La/react/tree/main/examples/nextjs)에 있습니다.

## TypeScript 지원

TypeScript를 완벽하게 지원합니다:

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

## 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE)를 참고하세요.

## 링크

- [웹사이트](https://captcha.la)
- [문서](https://docs.captcha.la/sdk/react)
- [대시보드](https://dash.captcha.la)
