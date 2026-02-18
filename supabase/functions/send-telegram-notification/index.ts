// Supabase Edge Function: Send Telegram Notifications
// Bot token is hardcoded - only Chat ID needed per client
// SECURE: Bot token never exposed to frontend

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Single bot token for all notifications
const BOT_TOKEN = '8579583220:AAEHGQeg7deZFyyMzIeSIxPWp-UZDlcBWlY'

async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    const result = await response.json()

    if (!result.ok) {
      return { success: false, error: result.description || 'Unknown Telegram error' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let body: {
      action?: string
      client_id?: string
      chat_id?: string
    } = {}

    try {
      body = await req.json()
    } catch {
      // No body - process pending notifications
    }

    // ACTION: Test connection with new chat_id
    if (body.action === 'test' && body.chat_id) {
      const testMessage = `🔔 *Test Notification*\n\nYour Telegram notifications are now connected!\n\n✅ You will receive task completion updates here.`

      const result = await sendTelegramMessage(body.chat_id, testMessage)

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Save chat_id for a client
    if (body.action === 'save' && body.client_id && body.chat_id) {
      const { data: existing } = await supabase
        .from('client_telegram_settings')
        .select('id')
        .eq('client_id', body.client_id)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('client_telegram_settings')
          .update({
            client_chat_id: body.chat_id,
            client_notifications_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('client_id', body.client_id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('client_telegram_settings')
          .insert({
            client_id: body.client_id,
            client_chat_id: body.chat_id,
            client_notifications_active: true,
          })

        if (error) throw error
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Settings saved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Test saved settings
    if (body.action === 'test_saved' && body.client_id) {
      const { data: settings, error: settingsError } = await supabase
        .from('client_telegram_settings')
        .select('client_chat_id')
        .eq('client_id', body.client_id)
        .single()

      if (settingsError || !settings?.client_chat_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'No Telegram settings found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const testMessage = `🔔 *Connection Test*\n\nYour Telegram connection is working!`
      const result = await sendTelegramMessage(settings.client_chat_id, testMessage)

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Disable notifications
    if (body.action === 'disable' && body.client_id) {
      const { error } = await supabase
        .from('client_telegram_settings')
        .update({ client_notifications_active: false })
        .eq('client_id', body.client_id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DEFAULT: Process pending notifications
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('telegram_notification_log')
      .select('id, client_id, message')
      .eq('status', 'pending')
      .limit(10)

    if (fetchError) {
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`)
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: { id: string; success: boolean; error?: string }[] = []

    for (const notification of pendingNotifications) {
      const { data: settings } = await supabase
        .from('client_telegram_settings')
        .select('client_chat_id, client_notifications_active')
        .eq('client_id', notification.client_id)
        .single()

      if (!settings?.client_chat_id || !settings.client_notifications_active) {
        await supabase
          .from('telegram_notification_log')
          .update({ status: 'failed', error_message: 'No active Telegram settings' })
          .eq('id', notification.id)

        results.push({ id: notification.id, success: false, error: 'No settings' })
        continue
      }

      const sendResult = await sendTelegramMessage(settings.client_chat_id, notification.message)

      await supabase
        .from('telegram_notification_log')
        .update({
          status: sendResult.success ? 'sent' : 'failed',
          error_message: sendResult.error || null,
        })
        .eq('id', notification.id)

      results.push({
        id: notification.id,
        success: sendResult.success,
        error: sendResult.error,
      })
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
