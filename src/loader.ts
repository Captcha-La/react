/**
 * Captchala SDK Loader
 * 支持多服务器 fallback 的 SDK 加载器
 */

// CDN 服务器列表（按优先级排序）
const STATIC_SERVERS = [
  'cdn.captcha-cdn.net',
  'cdn.captchala.com'
]

const SCRIPT_TIMEOUT = 10000

interface LoaderState {
  loading: boolean
  loaded: boolean
  error: Error | null
  promise: Promise<void> | null
}

const state: LoaderState = {
  loading: false,
  loaded: false,
  error: null,
  promise: null
}

declare global {
  interface Window {
    Captchala: any
  }
}

/**
 * 从服务器列表中加载脚本（带 fallback）
 */
function loadScriptWithFallback(
  servers: string[],
  path: string,
  index: number = 0
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (index >= servers.length) {
      reject(new Error('All CDN servers failed'))
      return
    }

    const url = `https://${servers[index]}${path}`
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.crossOrigin = 'anonymous'

    let loaded = false
    let timeoutId: ReturnType<typeof setTimeout>

    const cleanup = (removeScript: boolean = false) => {
      loaded = true
      clearTimeout(timeoutId)
      script.onload = null
      script.onerror = null
      // Remove failed script from DOM to prevent accumulation
      if (removeScript && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }

    script.onload = () => {
      if (loaded) return
      cleanup(false)  // Keep successful script
      resolve()
    }

    script.onerror = () => {
      if (loaded) return
      cleanup(true)  // Remove failed script
      // Try next server
      loadScriptWithFallback(servers, path, index + 1)
        .then(resolve)
        .catch(reject)
    }

    // Timeout fallback
    timeoutId = setTimeout(() => {
      if (loaded) return
      cleanup(true)  // Remove timed-out script
      loadScriptWithFallback(servers, path, index + 1)
        .then(resolve)
        .catch(reject)
    }, SCRIPT_TIMEOUT)

    document.body.appendChild(script)
  })
}

/**
 * 加载 CSS（从第一个服务器，CSS 失败不影响功能）
 */
function loadCss(servers: string[], path: string): void {
  const url = `https://${servers[0]}${path}`
  if (document.querySelector(`link[href="${url}"]`)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

export function loadCaptchalaSDK(): Promise<void> {
  // Already loaded
  if (state.loaded || window.Captchala) {
    state.loaded = true
    return Promise.resolve()
  }

  // Currently loading
  if (state.loading && state.promise) {
    return state.promise
  }

  state.loading = true
  state.promise = new Promise((resolve, reject) => {
    // Load CSS (non-blocking)
    loadCss(STATIC_SERVERS, '/captchala.css')

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="captchala.js"]')
    if (existingScript) {
      let checkCount = 0
      const maxChecks = SCRIPT_TIMEOUT / 50  // 200 checks = 10 seconds
      const checkReady = setInterval(() => {
        checkCount++
        if (window.Captchala) {
          clearInterval(checkReady)
          state.loaded = true
          state.loading = false
          resolve()
        } else if (checkCount >= maxChecks) {
          clearInterval(checkReady)
          state.loading = false
          state.error = new Error('SDK load timeout - script exists but SDK not initialized')
          reject(state.error)
        }
      }, 50)
      return
    }

    // Load JS with fallback
    loadScriptWithFallback(STATIC_SERVERS, '/captchala.js')
      .then(() => {
        state.loaded = true
        state.loading = false
        resolve()
      })
      .catch((err) => {
        state.loading = false
        state.error = err
        reject(err)
      })
  })

  return state.promise
}

export function isCaptchalaLoaded(): boolean {
  return state.loaded || !!window.Captchala
}
