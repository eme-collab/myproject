'use client'

import { useEffect, useMemo, useState } from 'react'
import { ui } from '@/lib/ui'

const DISMISS_KEY = 'prumo-install-card-dismissed-at'
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}

function isAppleMobile() {
  if (typeof window === 'undefined') return false

  return /iPad|iPhone|iPod/.test(window.navigator.userAgent)
}

function wasDismissedRecently() {
  if (typeof window === 'undefined') return false

  const rawValue = window.localStorage.getItem(DISMISS_KEY)

  if (!rawValue) {
    return false
  }

  const dismissedAt = Number(rawValue)

  if (Number.isNaN(dismissedAt)) {
    window.localStorage.removeItem(DISMISS_KEY)
    return false
  }

  const isStillHidden = Date.now() - dismissedAt < DISMISS_TTL_MS

  if (!isStillHidden) {
    window.localStorage.removeItem(DISMISS_KEY)
  }

  return isStillHidden
}

export default function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(true)
  const [isApple, setIsApple] = useState(false)
  const [isHidden, setIsHidden] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    setIsStandalone(isStandaloneMode())
    setIsApple(isAppleMobile())
    setIsHidden(wasDismissedRecently())

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setDeferredPrompt(null)
      setIsStandalone(true)
      setIsHidden(true)
      window.localStorage.removeItem(DISMISS_KEY)
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    )
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const shouldShow = useMemo(() => {
    if (isStandalone || isHidden) {
      return false
    }

    return Boolean(deferredPrompt) || isApple
  }, [deferredPrompt, isApple, isHidden, isStandalone])

  function dismissCard() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setIsHidden(true)
  }

  async function handleInstallClick() {
    if (!deferredPrompt) {
      return
    }

    try {
      setIsInstalling(true)
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice

      if (choice.outcome === 'accepted') {
        setIsHidden(true)
      }
    } finally {
      setDeferredPrompt(null)
      setIsInstalling(false)
    }
  }

  if (!shouldShow) {
    return null
  }

  return (
    <div className={ui.card.base}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={ui.text.sectionTitle}>Instalar o Prumo</h2>
          <p className={`mt-2 ${ui.text.muted}`}>
            Adicione o Prumo na tela inicial para abrir com cara de aplicativo e
            voltar mais rápido ao seu painel.
          </p>
        </div>

        <button
          type="button"
          onClick={dismissCard}
          className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 transition hover:bg-neutral-50"
          aria-label="Dispensar instrução de instalação"
        >
          Agora não
        </button>
      </div>

      {deferredPrompt ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={isInstalling}
            className={ui.button.primary}
          >
            {isInstalling ? 'Abrindo instalador...' : 'Instalar app'}
          </button>

          <button
            type="button"
            onClick={dismissCard}
            className={ui.button.secondary}
          >
            Depois
          </button>
        </div>
      ) : (
        <div className={`mt-4 ${ui.card.muted}`}>
          <p className={ui.text.body}>
            No iPhone ou iPad, toque em Compartilhar e depois em Adicionar à
            Tela de Início para instalar o Prumo.
          </p>
        </div>
      )}
    </div>
  )
}
