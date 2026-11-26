# @captcha-la/react

[English](https://github.com/Captcha-La/react/blob/main/README.md) · **简体中文** · [日本語](https://github.com/Captcha-La/react/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/react/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/react/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/react/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/react/blob/main/README.de.md)

Captchala 验证码 React 官方组件 —— 为你的 React 应用提供智能 CAPTCHA 防护。

[![npm version](https://img.shields.io/npm/v/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/react.svg)](https://www.npmjs.com/package/@captcha-la/react)
[![license](https://img.shields.io/npm/l/@captcha-la/react.svg)](https://github.com/Captcha-La/react/blob/main/LICENSE)

## 安装

```bash
npm install @captcha-la/react
# or
yarn add @captcha-la/react
# or
pnpm add @captcha-la/react
```

## 快速上手

### 组件方式

```tsx
import { Captchala } from '@captcha-la/react'

function App() {
  const handleSuccess = (result) => {
    console.log('验证成功')
    console.log('Token:', result.token)
    // 把 token 提交到你自己的后端校验
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

### Hook 方式

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
      // 继续提交表单
    } catch (err) {
      console.error('验证失败:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button type="submit" disabled={!ready}>
        登录
      </button>
    </form>
  )
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appKey` | `string` | *必填* | Captchala 应用 key |
| `serverToken` | `string` | - | 服务端签发的一次性 challenge token。当应用配置 `server_token_required=true` 时必填，详见下方 [生产环境：使用 serverToken](#生产环境使用-servertoken)。 |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 显示模式 |
| `action` | `string` | `'default'` | 业务场景标识 (例如 'login'、'register'、'checkout') |
| `lang` | `string` | 浏览器语言 | 语言代码 (`'zh-CN'`、`'en'`、`'ja'` 等)；不设置时跟随浏览器语言 |
| `onSuccess` | `(result) => void` | - | 验证成功回调 |
| `onExpired` | `() => void` | - | pass token 在使用前过期（只触发一次，代替 `onError`；组件会显示验证已过期），见 [Token 过期](#token-过期) |
| `onError` | `(error) => void` | - | 验证失败回调 |
| `onClose` | `() => void` | - | 关闭回调 |
| `onReady` | `() => void` | - | 就绪回调 |
| `name` | `string` | - | 表单字段名。设置后组件旁会渲染同名隐藏 input，验证通过后存放 pass token（重置、过期、出错时清空），普通表单提交或 Next.js Server Action 直接就能拿到。见 [Next.js](#nextjs) |
| `className` | `string` | - | 容器 class |
| `style` | `CSSProperties` | - | 容器 inline style |

## 通过 ref 调用方法

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
      <button onClick={handleManualVerify}>触发验证</button>
    </>
  )
}
```

| 方法 | 说明 |
|------|------|
| `verify()` | 手动触发验证 |
| `reset()` | 重置验证码状态 |
| `destroy()` | 销毁验证码实例 |
| `bindTo(selector)` | 绑定到指定元素（仅 'bind' 模式） |

## useCaptchala Hook

```tsx
const {
  ready,      // boolean - SDK 已就绪
  loading,    // boolean - SDK 加载中
  error,      // Error | null - 加载错误
  verify,     // () => Promise<CaptchalaResult> - 触发验证
  reset,      // () => void - 重置状态
  bindTo,     // (selector) => void - 绑定到元素
  appendTo    // (selector) => void - 追加到元素
} = useCaptchala(options)
```

## Token 过期

`onSuccess` 拿到的 pass token 有有效期。用户拖太久才提交时，组件会显示验证已过期（触发条或复选框提示重新验证；
`bind` 模式不显示任何内容，因为按钮是你自己的），并触发一次 `onExpired`，代替 `onError`。其余由你决定，例如显示你自己的提示，
再依次调用 `reset()`、`verify()` 重新验证（与其他验证码组件的 `expired-callback` + `reset()` + `execute()` 用法一致）：

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
{expired && <p>验证已过期。<button onClick={verifyAgain}>重新验证</button></p>}
```

不传 `onExpired` 时与以前相同，触发一次 `onError`（class 为 `expired`）。
离线或降级 token 不会触发 `onExpired`。`useCaptchala({ onExpired })` 用法相同。

## 显示模式

### Popup 模式（默认）
点击按钮弹出验证对话框。

```tsx
<Captchala appKey="your-key" product="popup" />
```

### Float 模式
浮动面板形式的验证码。

```tsx
<Captchala appKey="your-key" product="float" />
```

### Embed 模式
直接嵌入页面的验证码。

```tsx
<Captchala appKey="your-key" product="embed" />
```

### Bind 模式（配合 Hook）
最适合表单提交：用户提交时再触发验证。

```tsx
function Form() {
  const { ready, verify } = useCaptchala({
    appKey: 'your-key',
    product: 'bind'
  })

  const handleSubmit = async () => {
    const result = await verify()
    // result.token 即验证 token
  }

  return <button onClick={handleSubmit} disabled={!ready}>提交</button>
}
```

## 生产环境：使用 `serverToken`

生产环境（注册 / 登录 / 支付等）推荐使用 **服务端签发的一次性 token**。
后端持有 `app_secret`，调用 `POST /v1/server/challenge/issue`（带
`X-App-Key` + `X-App-Secret`）签发一次性 `server_token`（TTL 5 分钟，单次消费），
再下发给前端，浏览器拿到后用 `serverToken` 渲染组件：

```tsx
import { useState, useEffect } from 'react'
import { Captchala } from '@captcha-la/react'

function LoginPage() {
  const [serverToken, setServerToken] = useState<string>()

  useEffect(() => {
    // 你自己的后端代理 /v1/server/challenge/issue
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

后端示例（Express / Node.js）：

```js
// server.js — 在你自己的 /api/captcha-token handler 里调用
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

注意事项：
- 永远不要把 `X-App-Secret` 放进浏览器代码。
- 每个 `server_token` 只能用一次，每次挂载组件前都要重新生成。
- 老应用如果 `server_token_required=false`，仍然可以只用公开 `appKey` 模式。

## 服务端校验

收到 `onSuccess` 返回的 token 后，在你的服务端做最终校验：

```js
// 你的后端
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
  // 校验通过，继续处理业务请求
}
```

## Next.js

App Router 和 Pages Router 都能用。组件和 Hook 已标记 `'use client'`，可以直接写在 Server Component 页面里。

Server Component 不能传 `onSuccess` 这类回调，改用 `name`：token 会写进隐藏表单字段，Server Action 从表单数据里取出后在服务端校验，下面用的是 [`@captcha-la/node`](https://www.npmjs.com/package/@captcha-la/node)：

```tsx
// app/signup/page.tsx（Server Component）
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
      <button type="submit">注册</button>
    </form>
  )
}
```

```ts
// app/signup/actions.ts
'use server'
import { headers } from 'next/headers'
import { CaptchaLaClient } from '@captcha-la/node'

const captchala = new CaptchaLaClient() // 读取 CAPTCHALA_APP_KEY / CAPTCHALA_APP_SECRET

export async function signup(formData: FormData) {
  const token = String(formData.get('captchala_token') ?? '')
  const clientIp = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim()
  const result = await captchala.validate(token, { clientIp, expectedAction: 'signup' })
  if (!result.valid) {
    // 拒绝：原因见 result.error
    return
  }
  // 创建账号
}
```

- **Server token：** Server Component 渲染时就能签发，直接传给组件：
  `const issue = await captchala.issueServerToken('signup', { ttl: 300 })`，然后
  `serverToken={issue.token ?? undefined}`。
- **回调**（`onSuccess`、`ref.verify()`、`useCaptchala`）需要 Client Component：和普通 React 项目一样，放在以 `'use client'` 开头的文件里。
- **Pages Router：** 按普通 React 用法使用组件，在 API route 里校验。
- 完整的 App Router 示例（使用公开测试密钥）见 [`examples/nextjs`](https://github.com/Captcha-La/react/tree/main/examples/nextjs)。

## TypeScript 支持

完整 TypeScript 类型已内置：

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

## 开源协议

MIT，详见 [LICENSE](./LICENSE)。

## 链接

- [官网](https://captcha.la)
- [文档](https://docs.captcha.la/zh-CN/sdk/react)
- [Dashboard](https://dash.captcha.la)
