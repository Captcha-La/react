import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { loadCaptchalaSDK } from './loader'

export interface CaptchalaProps {
  appKey: string
  product?: 'popup' | 'float' | 'embed' | 'bind'
  action?: string
  lang?: string
  /** Element selector or HTMLElement to bind to (only for product="bind") */
  bindTo?: string | HTMLElement
  /**
   * One-time server_token issued by your backend via POST /v1/server/challenge/issue
   * (with X-App-Key + X-App-Secret). If your captcha app has
   * `server_token_required=true`, this prop is mandatory.
   * Recommended for production: prevents anyone with the public app_key
   * from farming out captchas to human-solver farms.
   */
  serverToken?: string
  /**
   * Optional: called by the SDK when the current `serverToken` is rejected by the
   * backend (server_token_invalid / exhausted / app_mismatch / binding_mismatch).
   * Return a fresh token to retry transparently once, or null to surface the error.
   * If not provided the SDK never auto-retries — onError fires immediately.
   */
  onServerTokenExpired?: () => Promise<string | null> | string | null
  /** Theme: preset string or { custom: { brightness: 'light' | 'dark' | 'system', ... } }. Omit to follow the system. */
  theme?: any
  onSuccess?: (result: CaptchalaResult) => void
  /**
   * Called once when the pass token of the last success expires before it was used,
   * instead of onError. The widget shows the expiry either way; show your own message
   * or call `ref.reset()` then `ref.verify()` for a new verification. Without it
   * onError fires once, as before.
   */
  onExpired?: () => void
  onError?: (error: any) => void
  onClose?: () => void
  onReady?: () => void
  className?: string
  style?: React.CSSProperties
}

export interface CaptchalaResult {
  token: string
  type: string
  action: string
  offline?: boolean
  clientOnly?: boolean
}

export interface CaptchalaRef {
  verify: () => void
  reset: () => void
  destroy: () => void
  bindTo: (selector: string | HTMLElement) => void
  setLang: (lang: string) => void
  getInstance: () => any
}

const Captchala = forwardRef<CaptchalaRef, CaptchalaProps>((props, ref) => {
  const {
    appKey,
    product = 'popup',
    action = 'default',
    lang,
    bindTo: bindToSelector,
    serverToken,
    theme,
    onServerTokenExpired,
    onSuccess,
    onExpired,
    onError,
    onClose,
    onReady,
    className,
    style
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const captchaInstanceRef = useRef<any>(null)

  // Store callbacks in refs to avoid dependency changes causing re-init
  const callbacksRef = useRef({ onSuccess, onExpired, onError, onClose, onReady, onServerTokenExpired })
  callbacksRef.current = { onSuccess, onExpired, onError, onClose, onReady, onServerTokenExpired }
  // Registered with the SDK only when given: without a handler the SDK behaves as before.
  const hasOnExpired = !!onExpired

  // Initialize captcha
  const initCaptcha = useCallback(async () => {
    try {
      await loadCaptchalaSDK()

      if (!window.Captchala || !containerRef.current) return

      // Destroy existing instance
      if (captchaInstanceRef.current) {
        captchaInstanceRef.current.destroy()
        captchaInstanceRef.current = null
      }

      // Clear container properly to avoid memory leaks
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }

      const instance = window.Captchala.init({
        appKey,
        product,
        action,
        lang,
        theme,
        serverToken,
        // SDK 调用时委派到 props.onServerTokenExpired (通过 ref, 避免闭包陈旧)
        onServerTokenExpired: () =>
          callbacksRef.current.onServerTokenExpired?.() ?? null,
      })

      // Use refs for callbacks to avoid stale closures
      instance
        .onReady(() => callbacksRef.current.onReady?.())
        .onSuccess((result: CaptchalaResult) => callbacksRef.current.onSuccess?.(result))
        .onError((err: Error) => callbacksRef.current.onError?.(err))
        .onClose(() => callbacksRef.current.onClose?.())
      if (hasOnExpired && typeof instance.onExpired === 'function') {
        instance.onExpired(() => callbacksRef.current.onExpired?.())
      }

      if (product === 'bind' && bindToSelector) {
        // bind mode: bindTo must be called synchronously after init
        instance.bindTo(bindToSelector)
      } else if (product !== 'bind') {
        instance.appendTo(containerRef.current)
      }

      captchaInstanceRef.current = instance
    } catch (err) {
      callbacksRef.current.onError?.(err)
    }
  }, [appKey, product, action, bindToSelector, serverToken, hasOnExpired])
  // 注意: lang 故意不在 deps 里. lang 改动走下面的 setLang 原地切, 不拆实例 (避免吞掉
  // 打开的 voice overlay 或者 popup). initCaptcha 内部读取 lang 是首次挂载用.

  // lang 变化: 不重挂, 原地调 setLang (voice overlay 会拉新语种音频 + 自动播放)
  useEffect(() => {
    if (captchaInstanceRef.current?.setLang) {
      captchaInstanceRef.current.setLang(lang)
    }
  }, [lang])

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    verify: () => captchaInstanceRef.current?.verify(),
    reset: () => captchaInstanceRef.current?.reset(),
    destroy: () => captchaInstanceRef.current?.destroy(),
    bindTo: (selector: string | HTMLElement) => captchaInstanceRef.current?.bindTo(selector),
    setLang: (l: string) => captchaInstanceRef.current?.setLang?.(l),
    getInstance: () => captchaInstanceRef.current
  }), [])

  // Initialize on mount and when key props change
  useEffect(() => {
    initCaptcha()

    return () => {
      if (captchaInstanceRef.current) {
        captchaInstanceRef.current.destroy()
        captchaInstanceRef.current = null
      }
    }
  }, [initCaptcha])

  const bindStyle: React.CSSProperties = product === 'bind'
    ? { minHeight: 0, position: 'absolute', width: 0, height: 0, overflow: 'hidden', ...style }
    : { minHeight: 50, ...style }

  return (
    <div
      ref={containerRef}
      className={className}
      style={bindStyle}
    />
  )
})

Captchala.displayName = 'Captchala'

export default Captchala
