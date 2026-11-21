# Changelog

## 1.1.0

- `onExpired` prop on `<Captchala>` and `useCaptchala({ onExpired })`: called once when the pass
  token of the last success expires before it was used. With it the widget stays as it is and
  onError does not fire; call `reset()` then `verify()` for a new verification. Without it,
  behaviour is unchanged (the bar shows "Verification expired" and onError fires once).
- Needs the current CDN SDK; with an older one the handler is never called.

## 1.0.2

- Pass the `theme` option through to the SDK; `lang` defaults to the browser language.

## 1.0.1

- Initial public release.
