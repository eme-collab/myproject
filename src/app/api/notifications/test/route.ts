import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushMessageToUser } from '@/lib/notifications/push'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { sentCount } = await sendPushMessageToUser(
    admin,
    user.id,
    {
      title: 'Prumo',
      body: 'Notificações ativas. Quando houver ação útil, o Prumo vai te chamar de volta.',
      url: '/painel',
      tag: 'prumo-test',
    },
    {
      markTestSent: true,
    }
  )

  if (sentCount === 0) {
    return NextResponse.json(
      { error: 'Nenhuma subscription ativa encontrada para este usuário.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, sentCount })
}
