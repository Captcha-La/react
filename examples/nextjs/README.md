# CaptchaLa + Next.js (App Router)

A sign-up form rendered by a Server Component and checked in a Server Action:

- `app/page.tsx` renders `<Captchala name="captchala_token" />` inside a plain `<form>`; no `'use client'` file is needed.
- `app/actions.ts` reads the token from the form data and validates it with [`@captcha-la/node`](https://www.npmjs.com/package/@captcha-la/node).
- The page also issues a one-time server token (`issueServerToken`), for apps that require one.

```bash
cp .env.example .env.local   # public test keys; replace with your own
npm install
npm run dev
```

The test keys in `.env.example` always pass without showing a challenge, see [Testing](https://docs.captcha.la/testing).
