import Link from 'next/link'
import { ui } from '@/lib/ui'

export default function OfflinePage() {
  return (
    <main className={ui.page.authShell}>
      <div className="mx-auto max-w-md space-y-4">
        <div className={ui.card.base}>
          <h1 className={ui.text.pageTitle}>Sem conexão</h1>
          <p className={`mt-3 ${ui.text.muted}`}>
            O Prumo precisa de internet para acessar seu painel e seus
            lançamentos com segurança.
          </p>
          <p className={`mt-2 ${ui.text.muted}`}>
            Quando a conexão voltar, abra o Prumo novamente pelo ícone ou volte
            para o login.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login" className={ui.button.secondary}>
              Ir para o login
            </Link>
          </div>
        </div>

        <div className={ui.card.muted}>
          <p className={ui.text.body}>
            Para proteger seus dados, o app não mostra informações financeiras
            salvas em cache quando você está offline.
          </p>
        </div>
      </div>
    </main>
  )
}
