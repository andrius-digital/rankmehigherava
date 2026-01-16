# Telegram Live Chat Integration Setup

This guide will help you complete the AVA Telegram integration so when visitors click **TYPE**, their messages go to your Telegram and you can respond directly.

## How It Works

```
Visitor clicks TYPE → Types message → You get Telegram notification
                                              ↓
You reply on Telegram → Webhook receives it → Visitor sees your response in real-time
```

---

## Step 1: Get Your Telegram Chat ID

1. Open this URL in your browser:
   ```
   https://api.telegram.org/bot8579583220:AAHcl0ElgV6VuDno-OZNQwKTKV2vDs3aYxE/getUpdates
   ```

2. If the response is empty (`"result":[]`), send any message to your bot first, then refresh

3. Look for your Chat ID in the response:
   ```json
   "chat": {
     "id": 123456789,  ← This is your Chat ID
     "first_name": "Your Name",
     ...
   }
   ```

---

## Step 2: Add Environment Variables to Supabase

Go to your Supabase Dashboard → Project Settings → Edge Functions → Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `TELEGRAM_BOT_TOKEN` | `8579583220:AAHcl0ElgV6VuDno-OZNQwKTKV2vDs3aYxE` |
| `TELEGRAM_CHAT_ID` | `YOUR_CHAT_ID_FROM_STEP_1` |

---

## Step 3: Run Database Migration

Run this SQL in Supabase SQL Editor (or apply the migration):

```sql
-- File: supabase/migrations/20260102_telegram_chat.sql
-- Copy and paste the contents of that file
```

---

## Step 4: Deploy Edge Functions

Deploy the new edge functions:

```bash
# From your project root
supabase functions deploy telegram-chat
supabase functions deploy telegram-webhook
```

---

## Step 5: Set Up Telegram Webhook

Tell Telegram where to send your replies:

```bash
curl -X POST "https://api.telegram.org/bot8579583220:AAHcl0ElgV6VuDno-OZNQwKTKV2vDs3aYxE/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/telegram-webhook"}'
```

Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project ID.

---

## Step 6: Test It!

1. Open your website
2. Click the AVA chat bubble
3. Click **TYPE**
4. Send a message
5. You should receive it on Telegram
6. Reply to the message on Telegram
7. The visitor should see your response in real-time!

---

## Telegram Commands

Once set up, you can use these commands in Telegram:

- `/active` or `/sessions` - Show active chat sessions
- `/help` - Show help message

To reply to a visitor, simply reply to their message thread.

---

## Troubleshooting

### Messages not arriving on Telegram
- Check that `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set correctly in Supabase secrets
- Check Edge Function logs in Supabase Dashboard

### Replies not reaching visitors
- Make sure the webhook is set up correctly (Step 5)
- Check that the visitor is still on the page (real-time only works while connected)
- Check Edge Function logs for errors

### Real-time not working
- Make sure the `telegram_chat_messages` table has realtime enabled
- Run: `ALTER PUBLICATION supabase_realtime ADD TABLE telegram_chat_messages;`

---

## Files Created

- `supabase/migrations/20260102_telegram_chat.sql` - Database tables
- `supabase/functions/telegram-chat/index.ts` - Sends messages to Telegram
- `supabase/functions/telegram-webhook/index.ts` - Receives your replies
- Updated `src/components/Chatbot.tsx` - Frontend integration

