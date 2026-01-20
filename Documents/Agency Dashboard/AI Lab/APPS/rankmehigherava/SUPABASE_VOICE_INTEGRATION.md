# 🎙️ Ava Voice Chat + Supabase Integration - Complete Guide

## ✅ What's Been Implemented

Your Vapi voice chat is now **fully integrated** with Supabase! Every call, message, and lead is automatically saved to your database.

---

## 📊 Database Tables Created

### 1. **`ava_voice_calls`** - Main Calls Table

Stores all voice call information:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `vapi_call_id` | TEXT | Unique Vapi call identifier |
| `assistant_id` | TEXT | Vapi assistant ID |
| `caller_phone` | TEXT | Caller's phone number |
| `caller_email` | TEXT | Caller's email |
| `caller_name` | TEXT | Caller's name |
| `call_status` | TEXT | initiated, active, completed, failed |
| `call_duration_seconds` | INTEGER | Call length in seconds |
| `started_at` | TIMESTAMPTZ | When call started |
| `ended_at` | TIMESTAMPTZ | When call ended |
| `transcript` | JSONB | Full conversation transcript |
| `summary` | TEXT | AI-generated summary |
| `sentiment` | TEXT | positive, neutral, negative |
| `is_qualified_lead` | BOOLEAN | Is this a qualified lead? |
| `lead_score` | INTEGER | Score 0-100 |
| `interested_in_services` | TEXT[] | Array of services mentioned |
| `business_name` | TEXT | Prospect's business name |
| `business_website` | TEXT | Prospect's website |
| `business_phone` | TEXT | Prospect's business phone |
| `needs_follow_up` | BOOLEAN | Needs follow-up? |
| `follow_up_notes` | TEXT | Follow-up notes |
| `follow_up_scheduled_at` | TIMESTAMPTZ | Scheduled follow-up time |
| `call_recording_url` | TEXT | URL to call recording |
| `metadata` | JSONB | Additional Vapi metadata |

### 2. **`ava_voice_messages`** - Individual Messages

Stores every message in a conversation:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `call_id` | UUID | Foreign key to ava_voice_calls |
| `role` | TEXT | 'user' or 'assistant' |
| `content` | TEXT | Message content |
| `timestamp` | TIMESTAMPTZ | When message was sent |
| `duration_seconds` | NUMERIC | Message duration |
| `confidence_score` | NUMERIC | Transcription confidence (0-1) |

### 3. **`ava_qualified_voice_leads`** - View

Pre-filtered view of qualified leads for easy access.

---

## 🔄 Auto-Save Features

### What Gets Saved Automatically:

✅ **Call Start** - Creates a new record when call begins
✅ **Call End** - Updates record with duration and status
✅ **Every Message** - Saves user and assistant messages
✅ **Lead Detection** - Automatically detects interested services
✅ **Lead Scoring** - Auto-calculates lead score based on keywords
✅ **Error Tracking** - Marks failed calls
✅ **Full Transcript** - Stores complete conversation

### Smart Lead Detection:

The system automatically detects when users mention:
- **"website"** / **"web"** → Interested in Custom Websites
- **"seo"** / **"google"** / **"rank"** → Interested in SEO Services
- **"social"** / **"instagram"** / **"facebook"** → Interested in Social Media
- **"email"** / **"sms"** → Interested in Marketing Automation

Lead score increases by 20 points per service mentioned (max 80).

---

## 📱 Voice Calls Dashboard

Access at: `/ava-voice-calls` (Protected route - requires login)

### Features:

1. **Real-time Stats Cards**
   - Total calls
   - Qualified leads
   - Average call duration
   - Follow-ups needed

2. **Filter Options**
   - All calls
   - Qualified leads only

3. **Call Details Display**
   - Call status badges
   - Sentiment indicators
   - Lead qualification badges
   - Interested services
   - Follow-up notes
   - Caller information
   - Business details

4. **Auto-refresh**
   - Data refreshes every 30 seconds

---

## 🎯 How to Use

### 1. Run the Migration

```bash
# Apply the database migration
# The migration file is already created at:
# supabase/migrations/20250102000000_ava_voice_calls.sql

# If using Supabase CLI:
supabase db push

# Or apply manually in Supabase Dashboard > SQL Editor
```

### 2. Test Voice Chat

1. Go to your homepage
2. Click "Talk to Ava" button
3. Allow microphone permissions
4. Have a conversation with Ava
5. End the call

### 3. View Saved Data

**Option A: Dashboard**
- Visit `/ava-voice-calls` in your app
- View all calls with rich details

**Option B: Supabase Dashboard**
- Go to Supabase Dashboard > Table Editor
- Select `ava_voice_calls` table
- View raw data

**Option C: Programmatically**
```typescript
import { useAvaVoiceStorage } from '@/hooks/useAvaVoiceStorage';

const { getRecentCalls, getQualifiedLeads } = useAvaVoiceStorage();

// Get recent calls
const calls = await getRecentCalls(10);

// Get qualified leads only
const leads = await getQualifiedLeads();
```

---

## 🛠️ Available Hooks & Functions

### `useAvaVoiceStorage()` Hook

```typescript
const {
  // Create new call
  createCall,
  
  // Update call by ID
  updateCall,
  
  // Update call by Vapi call ID
  updateCallByVapiId,
  
  // Add message to call
  addMessage,
  
  // Get messages for a call
  getCallMessages,
  
  // Get recent calls (default 10)
  getRecentCalls,
  
  // Get qualified leads only
  getQualifiedLeads,
  
  // Mark call as qualified
  markAsQualifiedLead,
  
  // Add follow-up notes
  addFollowUpNotes,
} = useAvaVoiceStorage();
```

### Example Usage:

```typescript
// Mark a lead as qualified
await markAsQualifiedLead(
  callId, 
  85, // lead score
  ['Custom Websites', 'SEO Services'] // services
);

// Add follow-up notes
await addFollowUpNotes(
  callId,
  'Very interested. Follow up tomorrow at 2 PM.',
  '2025-01-03T14:00:00Z' // scheduled time
);
```

---

## 🔐 Security & Best Practices

### 1. **API Key Security** (IMPORTANT!)

Your Vapi API key is currently hardcoded. **You must**:

1. Create `.env.local` file:
   ```bash
   VITE_VAPI_PUBLIC_KEY=5fcdd92d-d2a1-4b94-8189-f100ac650474
   ```

2. Update `src/components/AvaVoiceChat.tsx`:
   ```typescript
   const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
   ```

3. **Rotate your API key** in Vapi dashboard (since it was shared in chat)

### 2. **Row Level Security (RLS)**

Already enabled on both tables. Only authenticated users can access data.

### 3. **Database Indexes**

Already created for optimal query performance on:
- `vapi_call_id`
- `call_status`
- `started_at`
- `is_qualified_lead`
- `call_id` (for messages)

---

## 📈 Analytics & Insights

Query examples for business insights:

```sql
-- Conversion rate
SELECT 
  COUNT(*) FILTER (WHERE is_qualified_lead = true)::FLOAT / COUNT(*) * 100 as conversion_rate
FROM ava_voice_calls;

-- Average call duration by status
SELECT 
  call_status,
  AVG(call_duration_seconds) as avg_duration
FROM ava_voice_calls
GROUP BY call_status;

-- Most requested services
SELECT 
  UNNEST(interested_in_services) as service,
  COUNT(*) as count
FROM ava_voice_calls
WHERE interested_in_services IS NOT NULL
GROUP BY service
ORDER BY count DESC;

-- Sentiment distribution
SELECT 
  sentiment,
  COUNT(*) as count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM ava_voice_calls
WHERE sentiment IS NOT NULL
GROUP BY sentiment;
```

---

## 🎨 Customization

### Update Lead Detection Keywords

Edit `src/components/AvaVoiceChat.tsx` around line 85:

```typescript
// Add your own keywords
const services = [];
if (content.includes('your-keyword')) services.push('Your Service');
```

### Change Lead Scoring Algorithm

Edit `src/components/AvaVoiceChat.tsx` around line 95:

```typescript
// Current: 20 points per service
lead_score: Math.min(services.length * 20, 80)

// Custom: More complex scoring
lead_score: calculateCustomScore(services, duration, sentiment)
```

---

## 🚀 Next Steps

1. ✅ Run the database migration
2. ✅ Test voice chat and verify data saves
3. ✅ Move API key to environment variables
4. ✅ Rotate API key for security
5. ✅ Explore the dashboard at `/ava-voice-calls`
6. 📊 Set up Vapi webhooks for additional events (optional)
7. 🎯 Create automated follow-up workflows
8. 📧 Integrate with email marketing (optional)

---

## 📞 Support

- **Vapi Docs**: https://docs.vapi.ai
- **Supabase Docs**: https://supabase.com/docs
- **Dashboard**: `/ava-voice-calls`

---

## 🎉 Summary

You now have a **complete voice AI system** that:
- ✅ Talks to visitors on your website
- ✅ Automatically saves every conversation
- ✅ Detects and scores leads
- ✅ Tracks interested services
- ✅ Provides a beautiful dashboard
- ✅ Helps you follow up with prospects

All data is stored in your Supabase database and accessible via the dashboard or programmatically! 🚀





