import { useRef, useCallback, useState, useEffect } from 'react'
import { loadCaptchalaSDK } from './loader'

export interface UseCaptchalaOptions {
  appKey: string
  product?: 'popup' | 'float' | 'embed' | 'bind'
  action?: string
  lang?: string
  /** Theme: preset string or { custom: { brightness: 'light' | 'dark' | 'system', ... } }. Omit to follow the system. */
  theme?: any
  /**
   * Called once when the pass token of the last success expires before it was used.
   * The widget shows the expiry either way; call `reset()` then `verify()` for a new
   * verification.
   * Without it the SDK behaves as before.
   */
  onExpired?: () => void
}

export interface CaptchalaResult {
  token: string
  type: string
  action: string
  offline?: boolean
  clientOnly?: boolean
}

export interface UseCaptchalaReturn {
  ready: boolean
  loading: boolean
  error: Error | null
  verify: () => Promise<CaptchalaResult>
  reset: () => void
  bindTo: (selector: string | HTMLElement) => void
  appendTo: (selector: string | HTMLElement) => void
  setLang: (lang: string) => void
}

/**
 * Hook for using Captchala with more control
 */
export function useCaptchala(options: UseCaptchalaOptions): UseCaptchalaReturn {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const instanceRef = useRef<any>(null)
  const resolveRef = useRef<((result: CaptchalaResult) => void) | null>(null)
  const rejectRef = useRef<((error: Error) => void) | null>(null)
  const pendingRef = useRef<boolean>(false)  // Track if verify is pending
  const onExpiredRef = useRef(options.onExpired)
  onExpiredRef.current = options.onExpired
  const hasOnExpired = !!options.onExpired

  // Initialize
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        await loadCaptchalaSDK()

        if (!mounted || !window.Captchala) return

        const instance = window.Captchala.init({
          appKey: options.appKey,
          product: options.product || 'popup',
          action: options.action || 'default',
          lang: options.lang,
          theme: options.theme
        })

        instance
          .onReady(() => {
            if (mounted) {
              setReady(true)
              setLoading(false)
            }
          })
          .onSuccess((result: CaptchalaResult) => {
            pendingRef.current = false
            resolveRef.current?.(result)
            resolveRef.current = null
            rejectRef.current = null
          })
          .onError((err: any) => {
            pendingRef.current = false
            // The SDK reports err as a string (permanent errors) or as an Error/object (other paths).
            // Wrap it in an Error with message + the original data, so callers can read err.message in .catch.
            let normalized: Error
            if (err instanceof Error) {
              normalized = err
            } else if (typeof err === 'string') {
              normalized = new Error(err)
            } else if (err && typeof err === 'object') {
              normalized = new Error((err as any).message || (err as any).error || 'Verification failed')
              ;(normalized as any).cause = err
            } else {
              normalized = new Error('Verification failed')
            }
            rejectRef.current?.(normalized)
            resolveRef.current = null
            rejectRef.current = null
          })

        if (hasOnExpired && typeof instance.onExpired === 'function') {
          instance.onExpired(() => onExpiredRef.current?.())
        }

        instanceRef.current = instance
      } catch (err) {
        if (mounted) {
          setError(err as Error)
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      mounted = false
      if (instanceRef.current) {
        instanceRef.current.destroy()
        instanceRef.current = null
      }
    }
  }, [options.appKey, options.product, options.action, hasOnExpired])
  // Note: lang does not re-mount; the separate effect below switches it in place with setLang

  // lang change: switch in place, keeping the voice overlay / popup state (the overlay reloads its audio and autoplays)
  useEffect(() => {
    if (options.lang && instanceRef.current?.setLang) {
      instanceRef.current.setLang(options.lang)
    }
  }, [options.lang])

  const verify = useCallback((): Promise<CaptchalaResult> => {
    return new Promise((resolve, reject) => {
      if (!instanceRef.current) {
        reject(new Error('Captcha not initialized'))
        return
      }

      // Prevent multiple concurrent verify calls
      if (pendingRef.current) {
        reject(new Error('Verification already in progress'))
        return
      }

      pendingRef.current = true
      resolveRef.current = resolve
      rejectRef.current = reject
      // Defensive: if verify throws synchronously (e.g. a missing API method), clear pending and reject,
      // otherwise every later verify is blocked by "already in progress"
      try {
        instanceRef.current.verify()
      } catch (e: any) {
        pendingRef.current = false
        resolveRef.current = null
        rejectRef.current = null
        reject(e instanceof Error ? e : new Error(String(e?.message || e || 'verify() failed')))
      }
    })
  }, [])

  const reset = useCallback(() => {
    instanceRef.current?.reset()
  }, [])

  const bindTo = useCallback((selector: string | HTMLElement) => {
    instanceRef.current?.bindTo(selector)
  }, [])

  const appendTo = useCallback((selector: string | HTMLElement) => {
    instanceRef.current?.appendTo(selector)
  }, [])

  const setLang = useCallback((lang: string) => {
    instanceRef.current?.setLang?.(lang)
  }, [])

  return {
    ready,
    loading,
    error,
    verify,
    reset,
    bindTo,
    appendTo,
    setLang
  }
}
