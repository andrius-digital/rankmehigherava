# 🎙️ Vapi Call Recording Setup Guide

## Where Do I Get Vapi Recording URLs?

**Important:** Vapi sends recording URLs via **webhooks to your server**, not through client-side events. The client-side SDK doesn't include recording URLs for security reasons.

Here are your options:

---

## ✅ Option 1: Use Vapi Webhooks (Recommended)

This is the proper way to get recording URLs from Vapi.

### Step 1: Enable Recording in Vapi Dashboard

1. **Go to [Vapi Dashboard](https://dashboard.vapi.ai/)**
2. **Navigate to your Assistant settings**
3. **Enable "Call Recording"** (usually enabled by default)

### Step 2: Set Up Webhook Endpoint

You need a server endpoint to receive webhooks from Vapi. Here's what Vapi will send:

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "call_abc123",
      "status": "ended",
      "recordingUrl": "https://storage.vapi.ai/recordings/abc123.mp3",
      "transcript": "...",
      "summary": "...",
      "duration": 125
    }
  }
}
```

### Step 3: Configure Webhook in Vapi Dashboard

1. Go to **Vapi Dashboard > Assistant Settings > Server Messages**
2. Add your webhook URL (e.g., `https://yourdomain.com/api/vapi-webhook`)
3. Enable **"End of Call Report"** message type
4. Save settings

### Step 4: Create Webhook Handler

You'll need to create a server endpoint. Here are options:

#### Option A: Supabase Edge Function (Easiest)

Create `supabase/functions/vapi-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const payload = await req.json()
  
  // Check if this is an end-of-call-report
  if (payload.message?.type === 'end-of-call-report') {
    const call = payload.message.call
    
    // Update or insert call in Supabase
    const { error } = await supabase
      .from('ava_voice_calls')
      .update({
        call_recording_url: call.recordingUrl,
        vapi_call_id: call.id,
        call_duration_seconds: Math.round(call.duration || 0),
        summary: call.summary,
        call_status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('vapi_call_id', call.id)
    
    if (error) {
      console.error('Error updating call:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ received: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Deploy it:
```bash
npx supabase functions deploy vapi-webhook
```

Then use this URL in Vapi: `https://[your-project-ref].supabase.co/functions/v1/vapi-webhook`

---

## 🎯 Option 2: Manual Entry (For Testing)

While you're setting up webhooks, you can manually add recording URLs:

1. **Go to [Vapi Dashboard](https://dashboard.vapi.ai/)**
2. **Navigate to "Calls" section**
3. **Find your call** and click on it
4. **Copy the recording URL** from the call details
5. **Go to your Supabase dashboard**
6. **Open the `ava_voice_calls` table**
7. **Find the corresponding call** (match by date/time)
8. **Paste the recording URL** into the `call_recording_url` field
9. **Save** - the audio player will now work!

**Example Recording URL from Vapi:**
```
https://storage.vapi.ai/recordings/2024-01-02/call_abc123xyz.mp3
```

---

## 🔧 Option 3: Quick Workaround (No Server Needed)

If you just want to test the audio player without setting up webhooks:

### Use Public Test Audio

Update a call record in Supabase with a test audio URL:

```sql
UPDATE ava_voice_calls 
SET call_recording_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
WHERE id = 'your-call-id';
```

Or use any public MP3 URL to test the player functionality.

---

## 📊 What You Get from Vapi

### Call Metadata Available via Webhook:

```typescript
{
  id: "call_abc123",
  status: "ended",
  recordingUrl: "https://storage.vapi.ai/recordings/abc123.mp3",  // The recording!
  transcript: "Full conversation transcript...",
  summary: "AI-generated call summary",
  duration: 125,  // seconds
  startedAt: "2024-01-02T10:30:00Z",
  endedAt: "2024-01-02T10:32:05Z",
  cost: 0.15,  // USD
  analysis: {
    successEvaluation: "positive",
    structuredData: { ... }
  }
}
```

---

## 🚀 Getting Started (Easiest Path)

1. ✅ **Audio player is already built** - Check! Done!
2. 📝 **Make a test call** - Click "Talk to Ava" on your homepage
3. 🔍 **Find recording in Vapi Dashboard** - Go to Calls section
4. 📋 **Copy recording URL manually** - For now
5. 💾 **Paste into Supabase** - Update the call record
6. 🎧 **Test the player** - Visit Ava Voice Calls Dashboard
7. 🔌 **Set up webhook later** - When you're ready for automation

---

## 🧪 Testing the Audio Player Right Now

Want to see the player in action immediately?

1. **Make a test call** with "Talk to Ava"
2. **Go to Supabase dashboard** > `ava_voice_calls` table
3. **Find your call** (most recent one)
4. **Add this test URL** to `call_recording_url` field:
   ```
   https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav
   ```
5. **Go to Ava Voice Calls Dashboard**
6. **Click Play** - You should hear Star Wars theme (or use any MP3/WAV URL)

This proves the player works while you set up real Vapi webhooks!

---

## 🔍 Troubleshooting

### No Recording URL in Vapi Dashboard?

- **Check recording is enabled** in assistant settings
- **Wait 30-60 seconds** after call ends for processing
- **Check your Vapi plan** - some plans limit recordings
- **Call too short?** - Calls under 5 seconds may not be recorded

### Recording URL Returns 404?

- **Recording still processing** - wait a minute
- **Vapi storage issue** - check Vapi status page
- **URL expired** - some URLs are temporary (check Vapi plan)

### Webhook Not Receiving Data?

- **Check webhook URL is public** - can't be `localhost`
- **Verify HTTPS** - Vapi requires secure endpoints
- **Check Supabase logs** - Functions > vapi-webhook > Logs
- **Test with Postman** - Send a mock POST request

---

## 💡 Summary

**To get Vapi recording URLs:**

1. **Best:** Set up webhook → automatic recordings in database
2. **Quick:** Manually copy URLs from Vapi Dashboard
3. **Test:** Use public audio URLs to test the player

**The audio player is ready** - it just needs the `call_recording_url` field populated in your database!

---

## 📞 Need Help?

- 📖 [Vapi Webhooks Docs](https://docs.vapi.ai/webhooks)
- 📖 [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- 💬 [Vapi Discord](https://discord.gg/vapi)
- 📧 [Vapi Support](https://support.vapi.ai)

---

## 📦 What Data Does Vapi Provide?

When a call ends, Vapi sends a `call-end` event with data like:

```typescript
{
  id: "call_abc123xyz",           // Vapi's internal call ID
  duration: 125,                  // Call duration in seconds
  recordingUrl: "https://storage.vapi.ai/recordings/call_abc123xyz.mp3", // RECORDING URL!
  artifact: {
    recordingUrl: "...",          // Alternative location for recording URL
    transcript: "...",            // Full transcript
  },
  analysis: {
    summary: "Customer inquired about SEO services...",  // AI-generated summary
    successEvaluation: "positive", // Call outcome
  },
  // ... other metadata
}
```

---

## 🎯 Step 3: Update Your Code

I'll update the `AvaVoiceChat.tsx` component to capture the recording URL:

### Key Changes Needed:

1. **Capture the `callData` parameter** in the `call-end` event handler
2. **Extract the recording URL** from `callData.recordingUrl` or `callData.artifact.recordingUrl`
3. **Save it to Supabase** via `updateCallByVapiId()`

---

## 🧪 Step 4: Testing

1. **Make a test call** using "Talk to Ava" button
2. **Have a short conversation** (at least 10-15 seconds)
3. **End the call**
4. **Check Ava Voice Calls Dashboard** - the recording should appear
5. **Click the Play button** to listen to the recording

---

## 📊 Recording Availability

- **Delay:** Recordings may take 30-60 seconds to process after call ends
- **Format:** Usually MP3 or WAV format
- **Storage:** Vapi hosts recordings on their CDN
- **Retention:** Check your Vapi plan for storage limits

---

## 🔍 Troubleshooting

### No Recording URL Received?

1. **Check Vapi Dashboard** - Ensure recording is enabled
2. **Check console logs** - Add `console.log('Call end data:', callData)` to see what Vapi sends
3. **Verify call duration** - Very short calls (< 5 seconds) might not be recorded
4. **Check Vapi plan** - Some plans have recording limits

### Recording URL Returns 404?

- **Wait a minute** - Recording might still be processing
- **Check Vapi Dashboard** - Verify recording exists there
- **Contact Vapi Support** - They can check if recording was saved

---

## 🎧 How the Audio Player Works

Once the recording URL is saved to Supabase:

1. **Dashboard fetches calls** from `ava_voice_calls` table
2. **Audio player renders** with the `call_recording_url` field
3. **Click Play** - Browser loads and plays the audio file
4. **Use controls** - Play, pause, stop, seek, volume control

---

## 🚀 Alternative: Vapi Webhooks (Advanced)

For more reliable recording URLs, you can set up webhooks:

1. **Go to Vapi Dashboard > Webhooks**
2. **Add webhook endpoint** (you'd need a server endpoint)
3. **Subscribe to `call-end` events**
4. **Receive recording URL** via webhook POST request

This is more reliable than client-side event listeners but requires backend setup.

---

## 💡 Quick Start Checklist

- [ ] Enable recording in Vapi Dashboard
- [ ] Update `AvaVoiceChat.tsx` to capture `callData` parameter
- [ ] Extract `recordingUrl` from call-end event
- [ ] Save recording URL to Supabase
- [ ] Make a test call
- [ ] Check dashboard to verify recording appears
- [ ] Click Play to listen

---

Need help? Check:
- 📖 [Vapi Documentation](https://docs.vapi.ai/)
- 💬 [Vapi Discord](https://discord.gg/vapi)
- 📧 [Vapi Support](https://support.vapi.ai)

