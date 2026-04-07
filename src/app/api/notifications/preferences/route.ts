import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  defaultNotificationPreferences,
} from '@/lib/notifications/push'

function normalizePreferencesPayload(payload: unknown) {
  const input = payload as Partial<{
    push_enabled: boolean
    pending_enabled: boolean
    payables_enabled: boolean
    receivables_enabled: boolean
  }>

  return {
    push_enabled: Boolean(input.push_enabled),
    pending_enabled:
      typeof input.pending_enabled === 'boolean'
        ? input.pending_enabled
        : defaultNotificationPreferences.pending_enabled,
    payables_enabled:
      typeof input.payables_enabled === 'boolean'
        ? input.payables_enabled
        : defaultNotificationPreferences.payables_enabled,
    receivables_enabled:
      typeof input.receivables_enabled === 'boolean'
        ? input.receivables_enabled
        : defaultNotificationPreferences.receivables_enabled,
  }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('notification_preferences')
    .select(
      'push_enabled, pending_enabled, payables_enabled, receivables_enabled, last_pending_reminded_on, last_payables_reminded_on, last_receivables_reminded_on'
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    preferences: data ?? defaultNotificationPreferences,
    publicVapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const rawPayload = await request.json()
  const preferences = normalizePreferencesPayload(rawPayload)
  const admin = createAdminClient()

  const { error } = await admin.from('notification_preferences').upsert(
    {
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, preferences })
}
