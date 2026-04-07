'use client'

import { FormEvent, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ui } from '@/lib/ui'

function getIsStandaloneMode() {
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

export default function LoginClient() {
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isStandalone] = useState(getIsStandaloneMode)

  const urlError = searchParams.get('error')

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    setMessage('')

    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=/painel`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(
        isStandalone
          ? 'Link enviado. Ele deve abrir no navegador do celular. Depois de entrar, volte ao Prumo pelo ícone na tela inicial.'
          : 'Link enviado. Abra seu e-mail e clique para entrar.'
      )
    }

    setLoading(false)
  }

  return (
    <main className={ui.page.authShell}>
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Use Google ou receba um link mágico por e-mail.
        </p>

        {isStandalone && (
          <div className={`mt-4 ${ui.card.primary}`}>
            <p className="text-sm font-medium text-sky-900">
              No app instalado, entrar com Google tende a manter a experiência
              mais consistente.
            </p>
            <p className="mt-2 text-sm text-sky-800">
              O link por e-mail costuma abrir no navegador. Depois da
              autenticação, volte ao Prumo pelo ícone da tela inicial.
            </p>
          </div>
        )}

        {urlError && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Erro retornado pela autenticação: {urlError}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl border px-4 py-3 text-sm font-medium"
        >
          {loading ? 'Carregando...' : 'Entrar com Google'}
        </button>

        <div className="my-6 h-px bg-neutral-200" />

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              placeholder="voce@exemplo.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border px-4 py-3 text-sm font-medium"
          >
            {loading ? 'Enviando...' : 'Receber link por e-mail'}
          </button>
        </form>
      </div>
    </main>
  )
}
