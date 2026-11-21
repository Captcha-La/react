# Changelog

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
