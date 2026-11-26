# Changelog

## 1.2.0

- Next.js App Router: the build is marked `'use client'`, so `<Captchala>` can be rendered directly
  in a Server Component page (before, that failed with "useRef is not a function").
- New `name` prop: a hidden form field with that name holds the pass token after a success, and is
  emptied on reset, expiry and error. A plain form submit or a Server Action receives the token
  without client code.
- README: Next.js section; `examples/nextjs` (App Router, Server Action, server token, test keys).
- No change for existing code: without `name` the component renders exactly as before.

## 1.1.1

- README: server-side examples use the current endpoints (`https://verify.captcha.la/v1/validate`
  with `pass_token`, and `/v1/server/challenge/issue` on the same host); fixed documentation links.
  No code changes.

## 1.1.0

- `onExpired` prop on `<Captchala>` and `useCaptchala({ onExpired })`: called once when the pass
  token of the last success expires before it was used, instead of onError. Either way the
  widget shows that the verification expired; call `reset()` then `verify()` for a new
  verification, or show your own prompt. Without it, onError fires once, as before.
- Needs the current CDN SDK; with an older one the handler is never called.

## 1.0.2

- Pass the `theme` option through to the SDK; `lang` defaults to the browser language.

## 1.0.1

- Initial public release.
