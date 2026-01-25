# 🚀 Quick Start Guide - Ava Voice + Supabase

## ⚡ 3-Step Setup

### Step 1: Apply Database Migration

```bash
# Copy and run this in Supabase SQL Editor
# Or use Supabase CLI: supabase db push
```

The migration file is at: `supabase/migrations/20250102000000_ava_voice_calls.sql`

### Step 2: Test It Out

1. Open your homepage
2. Click "Talk to Ava"
3. Have a conversation
4. End call

### Step 3: View Your Data

Visit: `http://localhost:8080/ava-voice-calls`

---

## 📊 What Data Gets Saved?

| Event | What's Saved |
|-------|-------------|
| **Call Starts** | New record created with timestamp |
| **User Speaks** | Message saved with content & role='user' |
| **Ava Responds** | Message saved with content & role='assistant' |
| **Keywords Detected** | Services array updated, lead score calculated |
| **Call Ends** | Duration, status, transcript updated |

---

## 🔍 Quick Queries

### View All Calls
```sql
SELECT * FROM ava_voice_calls 
ORDER BY started_at DESC 
LIMIT 10;
```

### View Qualified Leads Only
```sql
SELECT * FROM ava_qualified_voice_leads;
```

### View Call Transcript
```sql
SELECT m.* 
FROM ava_voice_messages m
WHERE m.call_id = 'your-call-id'
ORDER BY m.timestamp ASC;
```

---

## 🎯 Lead Detection

Auto-detects when users mention:
- `website`, `web` → Custom Websites
- `seo`, `google`, `rank` → SEO Services  
- `social`, `instagram` → Social Media
- `email`, `sms` → Marketing Automation

Lead score = **20 points per service** (max 80)

---

## 🔐 Security Checklist

- [ ] Run database migration
- [ ] Move API key to `.env.local`
- [ ] Rotate Vapi API key
- [ ] Test voice chat
- [ ] View dashboard

---

## 📱 Access Points

- **Voice Chat**: Homepage (desktop & mobile)
- **Dashboard**: `/ava-voice-calls` (requires login)
- **Supabase**: Table Editor > `ava_voice_calls`

---

## 🆘 Troubleshooting

**Q: Voice chat not starting?**
- Check microphone permissions
- Check browser console for errors
- Verify Vapi API key is valid

**Q: Data not saving?**
- Check if migration was applied
- Verify Supabase connection
- Check browser console for errors

**Q: Can't access dashboard?**
- Make sure you're logged in
- Visit `/auth` to login

---

## 📚 Full Documentation

See `SUPABASE_VOICE_INTEGRATION.md` for complete guide.

---

**You're all set!** 🎉

Every voice call with Ava is now automatically saved to your Supabase database!





