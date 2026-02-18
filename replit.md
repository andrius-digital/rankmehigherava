# Replit.md

## Overview

This is the **Rank Me Higher** agency platform — a full-stack web application for a digital marketing agency that provides SEO, website creation, and AI-powered marketing services. The platform includes a public-facing marketing site, an internal agency dashboard, client portals, a reseller portal, and an AI assistant named "AVA" that handles voice calls, chat, and knowledge management.

The app is built as a React SPA using Vite, TypeScript, Tailwind CSS, and shadcn/ui components. The backend is entirely **Supabase** (PostgreSQL database, Edge Functions, auth, and storage). There is no custom backend server beyond a simple Express static file server for production deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin for fast compilation
- **Styling**: Tailwind CSS with CSS variables for theming (dark theme by default, red accent color)
- **UI Components**: shadcn/ui (Radix UI primitives) configured via `components.json`
- **Routing**: React Router DOM with SPA routing (client-side)
- **State Management**: TanStack React Query for server state, React Context for auth
- **Path Aliases**: `@/` maps to `./src/` directory

### Key Frontend Patterns

- Components live in `src/components/`, pages in `src/pages/`
- Protected routes use `src/components/ProtectedRoute.tsx` wrapping the auth context
- Auth context at `src/contexts/AuthContext.tsx` manages user sessions and admin checks
- Custom hooks in `src/hooks/` (e.g., `useAvaVoiceStorage`, `use-mobile`, `use-toast`)
- Font families: Montserrat (headings), Inter (body), Orbitron (tech/agency branding)
- Form handling uses react-hook-form with zod resolvers
- Drag-and-drop via `@dnd-kit`

### Backend (Supabase)

- **Database**: Supabase PostgreSQL (hosted at `vyviopkpwcsdrfpdwzpa.supabase.co`)
- **Auth**: Supabase Auth with role-based access (admin check in AuthContext)
- **Edge Functions**: Supabase Edge Functions for server-side logic:
  - `improve-text` — AI text improvement
  - `generate-website-prompt` — AI website prompt generation
  - `extract-gbp-info` — Google Business Profile scanning
  - `stripe-create-invoice` — Stripe invoice creation
  - Telegram webhook handling
  - Vapi webhook handling
- **Storage**: Supabase Storage for file uploads (images, logos)
- **Database Migrations**: SQL files in `supabase/migrations/`

### Database Tables (Key ones)

- `ava_knowledge` — AI knowledge base with vector embeddings
- `ava_training_examples` — Training examples for AVA
- `ava_usage_analytics` — Usage tracking
- `ava_training_queue` — Items needing attention
- `ava_voice_calls` — Voice call records from Vapi integration
- `ava_voice_messages` — Individual messages from voice calls
- Client/project management tables (website submissions, tasks, etc.)

### Page Structure

The app has multiple portals and dashboards:

- **Public pages**: Homepage (`/`), LocalMapBooster, Services pages, Blog
- **Agency dashboard**: `/agency-dashboard` — internal management
- **Client portal**: `/client-portal`, `/client-dashboard` — client-facing
- **Reseller portal**: `/reseller-portal`
- **Admin tools**: Task pipeline, team tracker, website builder dashboard, AVA training dashboard, voice calls dashboard, SEO spider tools
- **Auth**: `/auth` page for login/signup

### Production Deployment

- `server.js` — Express server that serves the built `dist/` folder and handles SPA routing
- `vercel.json` — Vercel deployment config with SPA rewrites
- Dev server runs on port 5000 with `0.0.0.0` host binding

### AI Assistant (AVA)

AVA is the central AI feature with three interaction modes:
1. **Voice Chat** — Vapi.ai integration (`@vapi-ai/web`) for real-time voice conversations
2. **Text Chat** — Chatbot component with Supabase Edge Function backend
3. **Knowledge Training** — Dashboard for managing AVA's knowledge base with OpenAI embeddings for semantic search

### Environment Variables

Configured via `vite.config.ts` `define` block (not `.env` files):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
- `VITE_VAPI_PUBLIC_KEY` — Vapi public key for voice chat
- `VITE_VAPI_ASSISTANT_ID` — Vapi assistant ID
- `VITE_OPENAI_API_KEY` — OpenAI API key for embeddings

Server-side secrets (in Supabase Edge Functions):
- `STRIPE_SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## External Dependencies

### Third-Party Services

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| **Supabase** | Database, Auth, Storage, Edge Functions | `@supabase/supabase-js` client in `src/integrations/supabase/` |
| **Vapi.ai** | Voice AI assistant | `@vapi-ai/web` SDK, client-side integration |
| **OpenAI** | Text embeddings for knowledge base, AI text generation | Via Supabase Edge Functions |
| **Stripe** | Invoice creation and payments | Via Supabase Edge Function (`stripe-create-invoice`) |
| **Telegram** | Live chat notifications | Via Supabase Edge Functions + Bot API |
| **Calendly** | Meeting scheduling | Client-side widget embed |
| **Wistia** | Video hosting/embedding | Client-side player embed |
| **Google Maps** | Office location embeds | iframe embeds |

### Key NPM Packages

- `@tanstack/react-query` — Server state management
- `react-router-dom` — Client-side routing
- `react-hook-form` + `@hookform/resolvers` + `zod` — Form handling and validation
- `@dnd-kit/*` — Drag and drop
- `react-helmet-async` — SEO meta tags
- `lucide-react` — Icons
- `recharts` — Charts and data visualization
- `date-fns` — Date utilities
- `sonner` — Toast notifications (alongside shadcn toast)
- `dompurify` — HTML sanitization