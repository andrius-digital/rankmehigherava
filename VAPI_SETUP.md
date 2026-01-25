# AVA Voice Chat Integration - Setup Guide

## ✅ Installation Complete!

Your Vapi voice chat has been integrated into your AVA platform. Users can now talk to Ava directly from your homepage!

## 🔧 Configuration Required

### Step 1: Get Your Vapi Assistant ID

1. Go to [Vapi Dashboard](https://dashboard.vapi.ai/)
2. Sign in with your account
3. Navigate to "Assistants" section
4. Create a new assistant or use an existing one
5. Copy the Assistant ID

### Step 2: Update the Voice Chat Component

Open `src/components/AvaVoiceChat.tsx` and replace line 45:

```typescript
// CURRENT (inline assistant):
await vapi.start({
  transcriber: { ... },
  voice: { ... },
  model: { ... }
});

// REPLACE WITH (using your assistant ID):
await vapi.start({
  assistantId: 'your-assistant-id-here', // Paste your Assistant ID from Vapi dashboard
});
```

### Step 3: Configure Your Vapi Assistant (Dashboard)

In your Vapi dashboard, configure your assistant with:

**System Prompt:**
```
You are Ava, an AI assistant for Rank Me Higher agency. You help businesses with their website needs, SEO, and digital marketing. You are friendly, professional, and knowledgeable.

Key information:
- We build custom websites with lead capture
- We manage websites on our AVA platform
- Monthly subscription model with 1 upgrade per month
- Built in 14 days
- Includes automated SMS & email follow-ups
- Clients get their own lead dashboard
- We also offer SEO services to rank businesses on page 1 of Google

Be conversational and help prospects understand our services.
```

**Recommended Voice Settings:**
- Provider: PlayHT or ElevenLabs
- Voice: Female voice (Jennifer, Bella, or similar)
- Language: English (US)

**Recommended Model:**
- Provider: OpenAI
- Model: GPT-4 or GPT-4-turbo

## 🔐 Security Recommendation

**IMPORTANT:** Your API key is currently hardcoded in the component. For production:

1. Move the API key to environment variables
2. Create a `.env.local` file:
   ```
   VITE_VAPI_PUBLIC_KEY=5fcdd92d-d2a1-4b94-8189-f100ac650474
   ```

3. Update `src/components/AvaVoiceChat.tsx`:
   ```typescript
   const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
   ```

4. **Rotate your API key** in the Vapi dashboard since it was shared in this conversation

## 📍 Where Voice Chat Appears

The voice chat component now appears in two places:

1. **Desktop Hero Section** - Below the CTA buttons
2. **Mobile Hero Section** - Below the video, above the callback button

## 🎨 Features Included

- ✅ "Talk to Ava" button with futuristic design
- ✅ Live call status indicator
- ✅ Volume level visualization
- ✅ Mute/Unmute controls
- ✅ End call button
- ✅ Toast notifications for call events
- ✅ Automatic cleanup on unmount

## 🧪 Testing

1. Run your dev server: `npm run dev`
2. Click "Talk to Ava" button
3. Allow microphone permissions when prompted
4. Start speaking to test the voice interaction

## 🎯 Next Steps

1. Get your Assistant ID from Vapi dashboard
2. Update the component with your Assistant ID
3. Test the voice chat thoroughly
4. Move API key to environment variables
5. Rotate your API key for security

## 📞 Vapi Support

If you need help with Vapi configuration:
- Documentation: https://docs.vapi.ai
- Support: https://support.vapi.ai
- Dashboard: https://dashboard.vapi.ai

---

**Note:** The current implementation uses an inline assistant configuration. For better performance and easier management, it's recommended to use a configured assistant from your Vapi dashboard.





