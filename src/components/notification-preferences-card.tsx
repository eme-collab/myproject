'use client'

import { useEffect, useState } from 'react'
import { ui } from '@/lib/ui'

type NotificationPreferences = {
  push_enabled: boolean
  pending_enabled: boolean
  payables_enabled: boolean
  receivables_enabled: boolean
}

const defaultPreferences: NotificationPreferences = {
  push_enabled: false,
  pending_enabled: true,
  payables_enabled: true,
  receivables_enabled: true,
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; ++index) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}

function getPermissionLabel(permission: NotificationPermission) {
  switch (permission) {
    case 'granted':
      return 'Ativas neste dispositivo'
    case 'denied':
      return 'Bloqueadas no navegador'
    default:
      return 'Ainda não autorizadas'
  }
}

export default function NotificationPreferencesCard() {
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [permission, setPermission] =
    useState<NotificationPermission>('default')
  const [publicVapidKey, setPublicVapidKey] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function saveSubscription(subscription: PushSubscription) {
    const response = await fetch('/api/notifications/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription.toJSON()),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }

      throw new Error(payload.error || 'Falha ao salvar subscription.')
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true)
        setError('')

        const isSupported =
          'Notification' in window &&
          'serviceWorker' in navigator &&
          'PushManager' in window

        setSupported(isSupported)

        if (!isSupported) {
          return
        }

        setPermission(Notification.permission)

        const preferencesResponse = await fetch(
          '/api/notifications/preferences',
          {
            cache: 'no-store',
          }
        )

        const preferencesPayload = (await preferencesResponse.json()) as {
          error?: string
          preferences?: NotificationPreferences
          publicVapidKey?: string
        }

        if (!preferencesResponse.ok) {
          throw new Error(
            preferencesPayload.error ||
              'Falha ao carregar preferências de notificação.'
          )
        }

        setPreferences(preferencesPayload.preferences ?? defaultPreferences)
        setPublicVapidKey(preferencesPayload.publicVapidKey ?? '')

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(Boolean(subscription))

        if (subscription) {
          await saveSubscription(subscription)
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Falha ao carregar notificações.'
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function savePreferences(nextPreferences: NotificationPreferences) {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextPreferences),
      })

      const payload = (await response.json()) as {
        error?: string
        preferences?: NotificationPreferences
      }

      if (!response.ok) {
        throw new Error(payload.error || 'Falha ao salvar preferências.')
      }

      setPreferences(payload.preferences ?? nextPreferences)
      setMessage('Preferências de notificação salvas.')
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Falha ao salvar preferências.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleEnableNotifications() {
    if (!supported || !publicVapidKey) {
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const nextPermission = await Notification.requestPermission()
      setPermission(nextPermission)

      if (nextPermission !== 'granted') {
        throw new Error(
          'Permissão de notificação não concedida neste dispositivo.'
        )
      }

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        })
      }

      await saveSubscription(subscription)
      setIsSubscribed(true)

      await savePreferences({
        ...preferences,
        push_enabled: true,
      })
    } catch (enableError) {
      setError(
        enableError instanceof Error
          ? enableError.message
          : 'Falha ao ativar notificações.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDisableNotifications() {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        const response = await fetch('/api/notifications/subscription', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string
          }

          throw new Error(payload.error || 'Falha ao remover subscription.')
        }

        await subscription.unsubscribe()
      }

      setIsSubscribed(false)

      await savePreferences({
        ...preferences,
        push_enabled: false,
      })
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : 'Falha ao desativar notificações.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleTestPush() {
    try {
      setTesting(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      })

      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(
          payload.error || 'Falha ao enviar notificação de teste.'
        )
      }

      setMessage('Notificação de teste enviada para este usuário.')
    } catch (testError) {
      setError(
        testError instanceof Error
          ? testError.message
          : 'Falha ao enviar notificação de teste.'
      )
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className={ui.card.base}>
        <h2 className={ui.text.sectionTitle}>Notificações úteis</h2>
        <p className={`mt-2 ${ui.text.muted}`}>Carregando preferências...</p>
      </div>
    )
  }

  if (!supported) {
    return (
      <div className={ui.card.base}>
        <h2 className={ui.text.sectionTitle}>Notificações úteis</h2>
        <p className={`mt-2 ${ui.text.muted}`}>
          Este navegador não suporta notificações push neste contexto.
        </p>
      </div>
    )
  }

  return (
    <div className={ui.card.base}>
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className={ui.text.sectionTitle}>Notificações úteis</h2>
          <p className={`mt-2 ${ui.text.muted}`}>
            Ative lembretes só para ações que valem a pena: revisar pendentes,
            pagar contas e acompanhar recebimentos.
          </p>
        </div>

        <span className={ui.badge.neutral}>{getPermissionLabel(permission)}</span>
      </div>

      {!publicVapidKey && (
        <div className={`mt-4 ${ui.card.warning}`}>
          <p className="text-sm text-amber-800">
            Falta configurar a chave pública VAPID para habilitar push
            notifications.
          </p>
        </div>
      )}

      {error && (
        <div className={`mt-4 ${ui.card.danger}`}>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {message && (
        <div className={`mt-4 ${ui.card.success}`}>
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={preferences.pending_enabled}
            disabled={!preferences.push_enabled || saving}
            onChange={(event) =>
              setPreferences((current) => ({
                ...current,
                pending_enabled: event.target.checked,
              }))
            }
          />
          <span className={ui.text.body}>Lançamentos pendentes para revisar</span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={preferences.payables_enabled}
            disabled={!preferences.push_enabled || saving}
            onChange={(event) =>
              setPreferences((current) => ({
                ...current,
                payables_enabled: event.target.checked,
              }))
            }
          />
          <span className={ui.text.body}>Contas a pagar vencendo ou vencidas</span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={preferences.receivables_enabled}
            disabled={!preferences.push_enabled || saving}
            onChange={(event) =>
              setPreferences((current) => ({
                ...current,
                receivables_enabled: event.target.checked,
              }))
            }
          />
          <span className={ui.text.body}>Valores a receber para acompanhar</span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {!preferences.push_enabled || !isSubscribed ? (
          <button
            type="button"
            onClick={handleEnableNotifications}
            disabled={saving || !publicVapidKey}
            className={ui.button.primary}
          >
            {saving ? 'Ativando...' : 'Ativar notificações'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void savePreferences(preferences)}
              disabled={saving}
              className={ui.button.secondary}
            >
              {saving ? 'Salvando...' : 'Salvar preferências'}
            </button>

            <button
              type="button"
              onClick={handleTestPush}
              disabled={testing}
              className={ui.button.secondary}
            >
              {testing ? 'Enviando teste...' : 'Enviar notificação de teste'}
            </button>

            <button
              type="button"
              onClick={handleDisableNotifications}
              disabled={saving}
              className={ui.button.secondary}
            >
              Desativar neste usuário
            </button>
          </>
        )}
      </div>
    </div>
  )
}
