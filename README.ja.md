# @captcha-la/react

[English](https://github.com/Captcha-La/react/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/react/blob/main/README.zh-CN.md) · **日本語** · [한국어](https://github.com/Captcha-La/react/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/react/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/react/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/react/blob/main/README.de.md)

Captchala CAPTCHA 公式 React コンポーネント - React アプリケーションをスマートな CAPTCHA で保護します。

[![npm version](https://img.shields.io/npm/v/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![license](https://img.shields.io/npm/l/@captcha-la/react.svg)](https://github.com/Captcha-La/react/blob/main/LICENSE)

## インストール

```bash
npm install @captcha-la/react
# or
yarn add @captcha-la/react
# or
pnpm add @captcha-la/react
```

## クイックスタート

### コンポーネントを使う方法

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

### Hook を使う方法

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

| Prop | 型 | デフォルト | 説明 |
|------|------|---------|-------------|
| `appKey` | `string` | *必須* | Captchala のアプリケーションキー |
| `serverToken` | `string` | - | サーバーが発行する使い捨てのチャレンジトークン。アプリで `server_token_required=true` が設定されている場合は必須です。下記の [本番環境: serverToken モード](#production-using-servertoken) を参照してください。 |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 表示モード |
| `action` | `string` | `'default'` | アクション識別子（例: 'login'、'register'、'checkout'） |
| `lang` | `string` | ブラウザの言語 | 言語コード（`'zh-CN'`、`'en'`、`'ja'` など）。未指定の場合はブラウザの言語 |
| `onSuccess` | `(result) => void` | - | 成功時のコールバック |
| `onExpired` | `() => void` | - | pass token が使用される前に期限切れになった（1 回だけ、`onError` の代わりに呼ばれます。ウィジェットには期限切れが表示されます）。[トークンの有効期限](#token-expiry) を参照 |
| `onError` | `(error) => void` | - | エラー時のコールバック |
| `onClose` | `() => void` | - | クローズ時のコールバック |
| `onReady` | `() => void` | - | 準備完了時のコールバック |
| `name` | `string` | - | フォームのフィールド名。指定すると、この名前の hidden input に pass token が格納されます（リセット、期限切れ、エラー時には空になります）。通常のフォーム送信や Next.js の Server Action でそのまま受け取れます。[Next.js](#nextjs) を参照 |
| `className` | `string` | - | コンテナのクラス名 |
| `style` | `CSSProperties` | - | コンテナのインラインスタイル |

## メソッド（ref 経由）

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

| メソッド | 説明 |
|--------|-------------|
| `verify()` | 検証を開始する |
| `reset()` | CAPTCHA の状態をリセットする |
| `destroy()` | CAPTCHA インスタンスを破棄する |
| `bindTo(selector)` | 要素にバインドする（'bind' モード用） |

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
## トークンの有効期限

`onSuccess` で受け取る pass token の有効期間は限られています。ユーザーが送信までに時間を置きすぎると、
ウィジェットに検証の期限切れが表示され（バーやチェックボックスが再検証を求めます。`bind` モードでは
ボタンがアプリ側のものなので何も表示されません）、`onError` の代わりに `onExpired` が 1 回だけ呼ばれます。
その後の処理はアプリ側で決められます。たとえば独自のメッセージを表示し、`reset()` に続けて `verify()` を
呼んで新しい検証を始めます（他の CAPTCHA ウィジェットにおける `expired-callback` + `reset()` + `execute()`
と同じパターンです）:

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

`onExpired` を指定しない場合は、従来どおり `onError` が 1 回だけ呼ばれます（クラス `expired`）。
オフライントークンや縮退モードのトークンでは `onExpired` は呼ばれません。`useCaptchala({ onExpired })`
も同じように動作します。

## 表示モード

### Popup モード（デフォルト）
ボタンを表示し、クリックすると CAPTCHA のポップアップダイアログを開きます。

```tsx
<Captchala appKey="your-key" product="popup" />
```

### Float モード
インラインのフローティング CAPTCHA ウィジェットを表示します。

```tsx
<Captchala appKey="your-key" product="float" />
```

### Embed モード
CAPTCHA をページ内に直接埋め込みます。

```tsx
<Captchala appKey="your-key" product="embed" />
```

### Bind モード（Hook と併用）
フォーム送信に最適です。ユーザーが送信したタイミングで検証します。

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
## 本番環境: `serverToken` を使う

本番環境（ログイン、登録、決済など）では、**サーバー発行トークンのフロー** をおすすめします。
バックエンドがアプリシークレットを保持し、`X-App-Key` + `X-App-Secret` を付けて
`POST /v1/server/challenge/issue` を呼び出し、使い捨ての `server_token`（TTL 5 分）を発行して
ブラウザに渡します。ブラウザはその `serverToken` を使ってウィジェットを描画します:

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

バックエンドのエンドポイント例（Express / Node.js）:

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

注意:
- `X-App-Secret` は決してブラウザ側のコードに含めないでください。
- 各 `server_token` は 1 回しか使えません。ウィジェットをマウントするたびに再発行してください。
- `server_token_required=false` の既存アプリは、公開 `appKey` のみのフローを引き続き利用できます。

## サーバー側での検証

`onSuccess` でトークンを受け取ったら、サーバー側で検証します:

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

このパッケージは App Router と Pages Router の両方で動作します。コンポーネントと Hook には
`'use client'` が付いているため、Server Component のページで `<Captchala>` を直接描画できます。

Server Component からは `onSuccess` のようなコールバックを渡せません。代わりに `name` を指定してください。
トークンが hidden のフォームフィールドに入り、Server Action がフォームデータからそれを読み取ってサーバー側で
検証します。ここでは [`@captcha-la/node`](https://www.npmjs.com/package/@captcha-la/node) を使っています:

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

- **Server token:** Server Component は描画中にトークンを発行し、そのままウィジェットに渡せます:
  `const issue = await captchala.issueServerToken('signup', { ttl: 300 })` としてから
  `serverToken={issue.token ?? undefined}` を指定します。
- **コールバック**（`onSuccess`、`ref.verify()`、`useCaptchala`）には Client Component が必要です。
  通常の React アプリと同様に、`'use client'` で始まるファイルに記述してください。
- **Pages Router:** 通常の React アプリと同様にコンポーネントを使い、API ルートで検証します。
- 公開テストキーを使った App Router の完全なサンプルは
  [`examples/nextjs`](https://github.com/Captcha-La/react/tree/main/examples/nextjs) にあります。

## TypeScript サポート

TypeScript に完全対応しています:

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

## ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照してください。

## リンク

- [Web サイト](https://captcha.la)
- [ドキュメント](https://docs.captcha.la/sdk/react)
- [ダッシュボード](https://dash.captcha.la)
