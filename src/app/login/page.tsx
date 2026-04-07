import { ui } from '@/lib/ui'
import { Suspense } from 'react'
import LoginClient from './login-client'

function LoginFallback() {
  return (
    <main className={ui.page.authShell}>
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="mt-2 text-sm text-neutral-600">Carregando...</p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  )
}
