import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type SubscriptionBody = {
  endpoint?: string
  expirationTime?: number | null
  keys?: {
    p256dh?: string
    auth?: string
  }
}

function isValidSubscription(body: SubscriptionBody) {
  return Boolean(body.endpoint && body.keys?.p256dh && body.keys?.auth)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const body = (await request.json()) as SubscriptionBody

  if (!isValidSubscription(body)) {
    return NextResponse.json(
      { error: 'Payload de subscription inválido.' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const userAgent = request.headers.get('user-agent')

  const { error } = await admin.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: body.endpoint,
      p256dh: body.keys?.p256dh,
      auth: body.keys?.auth,
      expiration_time: body.expirationTime ?? null,
      user_agent: userAgent,
      enabled: true,
      updated_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    },
    {
      onConflict: 'endpoint',
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as SubscriptionBody

  if (!body.endpoint) {
    return NextResponse.json(
      { error: 'Endpoint da subscription é obrigatório.' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', body.endpoint)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
