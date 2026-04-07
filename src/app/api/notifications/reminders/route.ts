import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getTodayInSaoPaulo,
  getTomorrowInSaoPaulo,
  sendPushMessageToUser,
  type NotificationPreferences,
} from '@/lib/notifications/push'

type ReminderPreferenceRow = NotificationPreferences & {
  user_id: string
}

async function countPendingReviews(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const { count, error } = await supabase
    .from('financial_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('review_status', 'pending')
    .in('processing_status', ['ready', 'failed'])

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function countOpenAccounts(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  entryType: 'sale_due' | 'expense_due',
  dueDateLimit: string
) {
  const { count, error } = await supabase
    .from('financial_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('review_status', 'confirmed')
    .eq('entry_type', entryType)
    .eq('settlement_status', 'open')
    .not('due_on', 'is', null)
    .lte('due_on', dueDateLimit)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

export async function POST(request: Request) {
  const cronSecret = process.env.NOTIFICATIONS_CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const providedSecret =
    request.headers.get('x-cron-secret') ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null)

  if (!cronSecret || providedSecret !== cronSecret) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = getTodayInSaoPaulo()
  const tomorrow = getTomorrowInSaoPaulo()

  const { data: preferences, error } = await supabase
    .from('notification_preferences')
    .select(
      'user_id, push_enabled, pending_enabled, payables_enabled, receivables_enabled, last_pending_reminded_on, last_payables_reminded_on, last_receivables_reminded_on'
    )
    .eq('push_enabled', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const sent: Array<{ user_id: string; type: string }> = []

  for (const preference of (preferences ?? []) as ReminderPreferenceRow[]) {
    const updates: Record<string, string> = {}

    if (
      preference.pending_enabled &&
      preference.last_pending_reminded_on !== today
    ) {
      const pendingCount = await countPendingReviews(supabase, preference.user_id)

      if (pendingCount > 0) {
        const result = await sendPushMessageToUser(
          supabase,
          preference.user_id,
          {
            title: 'Prumo',
            body: 'Você tem lançamentos pendentes para revisar.',
            url: '/painel',
            tag: 'prumo-pending-review',
          },
          { markReminderSent: true }
        )

        if (result.sentCount > 0) {
          updates.last_pending_reminded_on = today
          sent.push({ user_id: preference.user_id, type: 'pending' })
        }
      }
    }

    if (
      preference.payables_enabled &&
      preference.last_payables_reminded_on !== today
    ) {
      const payablesCount = await countOpenAccounts(
        supabase,
        preference.user_id,
        'expense_due',
        tomorrow
      )

      if (payablesCount > 0) {
        const result = await sendPushMessageToUser(
          supabase,
          preference.user_id,
          {
            title: 'Prumo',
            body: 'Há contas a pagar vencendo ou vencidas.',
            url: '/painel',
            tag: 'prumo-open-payables',
          },
          { markReminderSent: true }
        )

        if (result.sentCount > 0) {
          updates.last_payables_reminded_on = today
          sent.push({ user_id: preference.user_id, type: 'payables' })
        }
      }
    }

    if (
      preference.receivables_enabled &&
      preference.last_receivables_reminded_on !== today
    ) {
      const receivablesCount = await countOpenAccounts(
        supabase,
        preference.user_id,
        'sale_due',
        tomorrow
      )

      if (receivablesCount > 0) {
        const result = await sendPushMessageToUser(
          supabase,
          preference.user_id,
          {
            title: 'Prumo',
            body: 'Há valores a receber para acompanhar.',
            url: '/painel',
            tag: 'prumo-open-receivables',
          },
          { markReminderSent: true }
        )

        if (result.sentCount > 0) {
          updates.last_receivables_reminded_on = today
          sent.push({ user_id: preference.user_id, type: 'receivables' })
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('notification_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', preference.user_id)
    }
  }

  return NextResponse.json({
    success: true,
    processedUsers: preferences?.length ?? 0,
    sent,
  })
}
