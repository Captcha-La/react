import { useRef, useCallback, useState, useEffect } from 'react'
import { loadCaptchalaSDK } from './loader'

export interface UseCaptchalaOptions {
  appKey: string
  product?: 'popup' | 'float' | 'embed' | 'bind'
  action?: string
  lang?: string
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
          lang: options.lang || 'zh-CN'
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
            // SDK 上报的 err 可能是字符串(handleError permanent 分支)或 Error/对象(其他路径).
            // 统一包装成带 message + 原始数据的 Error, 业务方 .catch 里能 err.message 拿到文案.
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
  }, [options.appKey, options.product, options.action])
  // 注意: lang 不触发重挂 —— 见下方独立 effect 用 setLang 原地切

  // lang 改动: 原地切, 保留 voice overlay / popup 状态, 同时触发 overlay 的重拉+自动播放
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
      // 防御: verify 若同步抛 (例如 API 缺方法), 务必清 pending 并 reject,
      // 否则后续 verify 永远被 "already in progress" 拦住
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
