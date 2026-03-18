# Replit.md

## Overview

This is the **Rank Me Higher** agency platform — a full-stack web application for a digital marketing agency that provides SEO, website creation, and AI-powered marketing services. The platform includes a public-facing marketing site, an internal agency dashboard, client portals, a reseller portal, and an AI assistant named "AVA" that handles voice calls, chat, and knowledge management.

The app is built as a React SPA using Vite, TypeScript, Tailwind CSS, and shadcn/ui components. The backend uses **Supabase** (PostgreSQL database, Edge Functions, auth, and storage) plus an Express API server for AI screening features. Both dev and production use the same API logic.

### AI Screening System (Careers Page)

- **Production Server**: `server.js` — unified Express server with API endpoints + static file serving (port 5000)
- **Dev API Server**: `api-server.js` — standalone API server (port 3001), proxied via Vite (`/api` routes)
- **OpenAI Integration**: Uses Replit AI Integrations (no API key needed, billed to credits)
- **Flow**: Basic info → Chat-style AI conversation with AVA (5 questions, text or voice notes) → Required Loom video → AI evaluation with scores → Submit to Telegram
- **Component**: `src/components/AIScreeningQuiz.tsx` - chat-style conversation UI with voice recording
- **Endpoints**: `/api/screening/questions`, `/api/screening/evaluate`, `/api/screening/submit`, `/api/screening/transcribe` (Whisper voice-to-text)
- **Telegram Notifications**: Direct Telegram Bot API calls routed by department (Sales → `-1003705919643`, Creative → `-1003863683808`, Marketing → `-1003516103565`, Software Engineers → `-1003711003707`)
- **Salary Calculator Currencies**: USD, PHP (₱, ×56), PKR (₨, ×278), INR (₹, ×84) — order: USD, PHP, PKR, INR
- **Position-specific hours**: Positions can define `minHours`/`maxHours` (default 20–40); fixed-hour positions (min===max) show "Fixed X hrs/week" instead of slider
- **Commission roles**: Positions with `commission` field show "+ commission (not included above)" note below calculator
- **Voice Notes**: Browser MediaRecorder captures audio → sent to `/api/screening/transcribe` → OpenAI Whisper transcription → pre-filled as text answer
- **Shareable Position Links**: `/careers?position=<id>` auto-opens the position popup, with copy-link button in modal
- **Dependencies**: `multer` for file upload handling on transcription endpoint
- **Dev script**: `npm run dev` starts both API server (port 3001) and Vite (port 5000)
- **Deployment**: Autoscale with `node server.js` (build: `npm run build`)

### AI Script Generation System (Content Portal)

- **Endpoints**: `/api/script/generate`, `/api/script/knowledge`, `/api/script/training`, `/api/script/approve`
- **Knowledge Base**: Stored in `data/script_knowledge.json` — contains training docs and approved scripts
- **Self-Learning Loop**: AI generates script → manager reviews/edits → approves → script saved to knowledge base tagged by industry → future scripts reference approved examples
- **Industry Memory**: Scripts tagged by client industry (Trucking, HVAC, etc.) — AI pulls same-industry approved scripts as examples when generating
- **Training Materials**: Upload script frameworks, style guides, examples — AI references all training docs when generating
- **Script Status**: `draft` → `ai-generated` → `approved` (tracked per video)
- **Content Portal Pricing**: ACTOR_COST=$75/hr, FILMER_COST=$75/hr, ACTOR_CHARGE=$150/hr, FILMER_CHARGE=$150/hr, SHORT_FORM_PRICE=$30, VSL_PRICE=$150, YOUTUBE_PRICE=$150, VALUE_ADDED_PRICE=$30, EDITOR_COST_PER_VIDEO=$7, EDITOR_COST_PER_VSL=$30, EDITOR_COST_PER_YOUTUBE=$150, MANAGER_FEE=10% of gross profit
- **Content Types**: short-form, vsl, value-added, youtube — each with distinct pricing and editor costs
- **Discount**: Per-shoot `discountPercent` field applied to subtotal revenue before profit calculation
- **Editable Fields**: Client name (click-to-edit in client detail), shoot location (inline editable in shoot detail)
- **Shoot Pipeline**: 3-column Kanban (Scheduled/In Progress/Completed) on clients view; shoot cannot be marked Completed until all videos are Done
- **Data Storage**: Content Portal data (clients, shoots, videos, managers) stored in Supabase `content_portal_data` table as JSONB (single row, id=1); auto-migrates from localStorage on first load; RLS allows authenticated users full access and anonymous users read-only (for Manager Portal)
- **Video Managers**: Manager profiles stored in Supabase (`content_portal_data.managers` JSONB) with name, email, access code; assigned per shoot via `managerName` field
- **Manager Portal**: `/manager-portal` — standalone page (no auth required), managers log in with access code, see only their assigned shoots in pipeline view with shoot details (read-only)
- **Team Access**: `/team-access` — admin page for creating team members with real Supabase Auth accounts; stores permissions in `team_portal_members` table; admin creates account → Supabase Auth user created + 'team' role assigned + permissions saved to DB
- **Team Portal**: `/team` — standalone team login page using Supabase Auth (email/password); after login checks `team_portal_members` table for permissions; shows only permitted cards; `/team-portal` redirects here; session cached in `rmh_team_session` sessionStorage; back buttons in sub-pages detect team session and route back to `/team` instead of admin dashboard
- **Admin Dashboard**: `/avaadminpanel` — protected admin-only route (Supabase auth required), renders AgencyDashboard; all admin sub-pages link back here
- **Database Table**: `team_portal_members` — id, user_id (FK to auth.users), name, email, role, permissions (TEXT[]), created_at, updated_at; RLS: admins full access, team members read own record
- **Team Permissions**: content-portal, applicant-tracker, client-portal, build-website, subscriptions, team-tracker, call-center-kpi, gbp-management
- **ProtectedRoute**: `teamPermission` prop allows team sessions to bypass Supabase auth for permitted routes

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

### SEO & Crawling

- **Google Search Console**: Verification meta tag in `index.html`
- **robots.txt**: `public/robots.txt` — allows public pages, blocks internal/admin routes; AI crawlers (GPTBot, ClaudeBot, ChatGPT-User, Google-Extended, anthropic-ai, PerplexityBot, Applebot-Extended, cohere-ai, Bytespider) explicitly allowed; social bots (Twitterbot, facebookexternalhit, LinkedInBot) allowed
- **sitemap.xml**: `public/sitemap.xml` — 10 public pages (home, services/websites, services/seo, services/outbound, services/content-ads, services/ads-content, localmapbooster, contact, careers, blog)
- **JSON-LD Schemas**: Organization + WebSite + LocalBusiness on homepage; Service + BreadcrumbList on each service page; JobPosting ItemList on Careers; Blog schema on Blog; Article schema on BlogPost
- **OG/Twitter Meta**: All public pages have og:title, og:description, og:type, og:url, og:image, twitter:card, twitter:title, twitter:description
- **Canonical URLs**: All public pages have `<link rel="canonical">` pointing to `https://rankmehigher.com/...`
- **Domain**: `rankmehigher.com` (not `.io`)

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