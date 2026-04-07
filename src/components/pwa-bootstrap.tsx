'use client'

import { useEffect } from 'react'

const SW_RELOAD_GUARD_KEY = 'prumo-sw-reloading'

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}

export default function PwaBootstrap() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    let currentRegistration: ServiceWorkerRegistration | null = null
    const mediaQuery = window.matchMedia('(display-mode: standalone)')

    function syncDisplayMode() {
      const displayMode = isStandaloneMode() ? 'standalone' : 'browser'
      document.documentElement.dataset.displayMode = displayMode
      document.body.dataset.displayMode = displayMode
    }

    function clearReloadGuard() {
      sessionStorage.removeItem(SW_RELOAD_GUARD_KEY)
    }

    function handleControllerChange() {
      if (sessionStorage.getItem(SW_RELOAD_GUARD_KEY) === '1') {
        return
      }

      sessionStorage.setItem(SW_RELOAD_GUARD_KEY, '1')
      window.location.reload()
    }

    async function checkForUpdates() {
      try {
        if (!currentRegistration) {
          return
        }

        await currentRegistration.update()
      } catch (error) {
        console.error('Falha ao procurar atualizações do app:', error)
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        syncDisplayMode()
        void checkForUpdates()
      }
    }

    function handleFocus() {
      syncDisplayMode()
      void checkForUpdates()
    }

    syncDisplayMode()
    clearReloadGuard()

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange
    )
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', clearReloadGuard)

    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', syncDisplayMode)
    }

    void (async () => {
      currentRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      void checkForUpdates()
    })()

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange
      )
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', clearReloadGuard)

      if ('removeEventListener' in mediaQuery) {
        mediaQuery.removeEventListener('change', syncDisplayMode)
      }
    }
  }, [])

  return null
}
