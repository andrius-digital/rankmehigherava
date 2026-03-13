# SEO Audit Report: rankmehigher.com

**Date:** March 13, 2026
**Business Type:** B2B Digital Marketing / SEO Agency (Local — Chicago)
**Tech Stack:** React (Vite) SPA, Express.js, Supabase, Google Cloud

---

## SEO Health Score: 28/100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 25% | 20/100 | 5.0 |
| Content Quality | 25% | 40/100 | 10.0 |
| On-Page SEO | 20% | 30/100 | 6.0 |
| Schema / Structured Data | 10% | 15/100 | 1.5 |
| Performance (CWV) | 10% | 35/100 | 3.5 |
| Images | 5% | 20/100 | 1.0 |
| AI Search Readiness | 5% | 20/100 | 1.0 |
| **Total** | | | **28.0** |

---

## Executive Summary

### Top 5 Critical Issues
1. **Client-Side Rendering (CSR) Only** — Search engines see an empty `<div id="root"></div>` with zero content on every page
2. **No SSR/SSG** — No server-side rendering or static generation; all content requires JavaScript execution
3. **Identical HTML for all routes** — Every URL returns the same 1,437-byte `index.html` shell (confirmed via `content-length: 1437` and identical `etag` across all pages)
4. **No page-specific meta tags in HTML** — `react-helmet-async` sets meta tags client-side, but crawlers may not execute JS to see them
5. **No canonical tags in static HTML** — Canonicals only exist inside React Helmet (JS-dependent)

### Top 5 Quick Wins
1. Add prerendering (react-snap or prerender.io) for immediate SSR-like benefits
2. Add `llms.txt` file for AI crawler discoverability
3. Add `lastmod` dates to sitemap.xml
4. Add missing security headers (CSP, X-Frame-Options, X-Content-Type-Options)
5. Add Organization + LocalBusiness schema to `index.html` as static JSON-LD

---

## 1. Technical SEO (Score: 20/100)

### Crawlability
- **CRITICAL:** All pages return identical HTML shell — no unique content per route
- **robots.txt:** Well-configured — allows all major crawlers, blocks admin paths ✅
- **Sitemap:** Present at `/sitemap.xml` with 10 URLs ✅
- **Sitemap issues:** No `lastmod` dates, missing several discoverable pages

### Indexability
- **CRITICAL:** No server-rendered content for crawlers to index
- Google may eventually render JS content, but with significant delays
- Bing and other search engines have limited/no JS rendering capability
- No `<link rel="canonical">` in static HTML (only via client-side Helmet)
- No `hreflang` tags (single-language site, acceptable)

### Security Headers
| Header | Status |
|--------|--------|
| HTTPS | ✅ Active |
| HSTS | ✅ `max-age=63072000; includeSubDomains` |
| X-Powered-By | ⚠️ Exposed (`Express`) — should be removed |
| Content-Security-Policy | ❌ Missing |
| X-Frame-Options | ❌ Missing |
| X-Content-Type-Options | ❌ Missing |
| Referrer-Policy | ❌ Missing |
| Permissions-Policy | ❌ Missing |

### URL Structure
- Clean URLs ✅ (`/services/seo`, `/contact`, `/blog`)
- No trailing slash inconsistencies detected ✅
- Duplicate file issue: Many pages have `" 2.tsx"` copies (e.g., `Index 2.tsx`, `Contact 2.tsx`) — these should be cleaned up

### JavaScript Rendering
- **CRITICAL:** Pure client-side React SPA
- No SSR, no SSG, no prerendering
- `<div id="root"></div>` is the only DOM element served
- Total HTML payload: 1,437 bytes (essentially empty)
- All routing handled by `react-router-dom` (client-side)

### Server
- Hosted on Google Cloud (Google Frontend)
- Express.js backend with API proxy
- HTTP/2 enabled ✅
- Cache-Control: `private, max-age=0` — no caching of HTML ⚠️

---

## 2. Content Quality (Score: 40/100)

### E-E-A-T Assessment

**Experience:** ⚠️ Limited
- No case studies, portfolios, or client results pages visible in sitemap
- Blog exists with posts about SEO topics — good signal
- Calendly integration suggests active client engagement

**Expertise:** ⚠️ Moderate
- Service pages have detailed pain points and features (in JS)
- Blog covers SEO topics with category filtering
- No author bios, credentials, or team page in sitemap

**Authoritativeness:** ❌ Weak
- No testimonials visible to crawlers (JS-rendered)
- No industry certifications or partnerships displayed
- No press mentions or awards
- Social signals: Twitter (`@RankMeHigher`) referenced but no verification

**Trustworthiness:** ⚠️ Moderate
- HTTPS ✅
- Google Site Verification present ✅
- Privacy and Terms pages exist
- Physical location (Chicago) referenced in blog meta
- Missing: BBB, industry badges, client logos in static HTML

### Content Depth (based on source code review)
- **Homepage:** Rich content in JS — services, CTAs, qualification form, Calendly integration
- **Services pages:** Detailed pain points, features, FAQ sections, process explanations
- **Blog:** Category filtering, featured/trending posts, good structure
- **Problem:** None of this content is visible to search engines without JS

### Readability
- Copy is punchy, sales-oriented ("Google Map Dominance", "Search Monopoly", "Zero risk")
- Short sentences, action-oriented ✅
- May be too aggressive/salesy for E-E-A-T signals

---

## 3. On-Page SEO (Score: 30/100)

### Title Tags
| Page | Title (from Helmet in JS) | In Static HTML? |
|------|--------------------------|-----------------|
| Homepage | Rank Me Higher - SEO & Website Solutions | ✅ (in index.html) |
| /services/seo | Set via Helmet | ❌ JS only |
| /blog | SEO Insights & Local Marketing Tips \| Rank Me Higher Blog | ❌ JS only |
| /contact | Set via Helmet | ❌ JS only |
| All others | Set via Helmet | ❌ JS only |

### Meta Descriptions
- Homepage: "Professional SEO and website creation services to help your business rank higher" ✅ (static)
- All other pages: JS-only via Helmet ❌
- Descriptions are generic — not optimized per service/keyword

### Heading Structure
- All headings are JS-rendered — invisible to crawlers
- Source code shows proper H1/H2/H3 hierarchy in React components ✅
- But none of this reaches the static HTML

### Internal Linking
- Navigation links exist in React components ✅
- Footer links exist ✅
- Blog has category links and post links ✅
- **Problem:** All links are `react-router-dom` client-side navigation — no `<a href>` in static HTML

### Missing Pages in Sitemap
Pages that should be in sitemap.xml but aren't:
- `/services/outbound` (referenced in nav but not in sitemap — wait, it is there ✅)
- Individual blog post URLs
- `/privacy` and `/terms`
- About/Team page (doesn't seem to exist)

---

## 4. Schema / Structured Data (Score: 15/100)

### Current Implementation
- **Blog page:** Has JSON-LD `Blog` schema via Helmet ✅
- **All other pages:** No structured data detected
- **Problem:** Blog schema is JS-rendered, not in static HTML

### Missing Schema (Recommended)
| Schema Type | Where | Priority |
|-------------|-------|----------|
| `Organization` | Homepage | Critical |
| `LocalBusiness` / `ProfessionalService` | Homepage | Critical |
| `WebSite` with `SearchAction` | Homepage | High |
| `Service` | Each service page | High |
| `BreadcrumbList` | All pages | Medium |
| `FAQPage` | Service pages with FAQ sections | High |
| `BlogPosting` | Individual blog posts | High |
| `ContactPage` | Contact page | Medium |

---

## 5. Performance (Score: 35/100)

### Server Response
- TTFB: Fast (Google Cloud Frontend) ✅
- HTTP/2 ✅
- Content-Length: 1,437 bytes for HTML shell (tiny, but empty)

### Estimated CWV Issues (SPA-specific)
- **LCP:** Likely poor — entire page must load JS bundle, then render
- **INP:** Unknown — React SPA with client-side routing may be acceptable
- **CLS:** Likely poor — content pops in after JS loads (no SSR skeleton)
- **FCP:** Delayed — nothing renders until JS bundle loads and executes

### Resource Concerns
- Vite bundles React app — bundle size unknown from server
- Calendly widget loaded externally (render-blocking potential)
- No `Cache-Control` on HTML (`max-age=0`)
- Static assets caching: Unknown

### Third-Party Scripts
- Calendly widget (CSS + JS loaded in `<head>`)
- Supabase client
- Vapi voice integration
- OpenAI integration (via API server)

---

## 6. Images (Score: 20/100)

- OG image: `/assets/logo.png` (relative path — should be absolute URL)
- Twitter image: `/assets/logo.png` (same issue)
- All other images are loaded via JS — not auditable from static HTML
- No `<img>` tags in static HTML
- Cannot verify alt text, sizing, format, or lazy loading without JS execution

---

## 7. AI Search Readiness (Score: 20/100)

### AI Crawler Access
- robots.txt **explicitly allows** all major AI crawlers ✅
  - GPTBot, Google-Extended, ChatGPT-User, ClaudeBot, PerplexityBot, Bytespider, Applebot-Extended, cohere-ai, anthropic-ai
- **But crawlers receive empty HTML** — the access permission is meaningless ❌

### llms.txt
- `/llms.txt` — Not found ❌
- `/.well-known/llms.txt` — Not found ❌

### Citability
- No structured content visible to AI systems
- No FAQ sections in static HTML
- No definitive statements that AI could quote
- Blog content exists but only in JS

### Brand Signals
- No Wikipedia/Wikidata presence detected
- No structured organization data
- Social: Twitter handle referenced but unverified

---

## Sitemap Analysis

### Current Sitemap (10 URLs)
```
https://rankmehigher.com/                    priority: 1.0  weekly
https://rankmehigher.com/services/websites   priority: 0.9  monthly
https://rankmehigher.com/services/seo        priority: 0.9  monthly
https://rankmehigher.com/services/outbound   priority: 0.8  monthly
https://rankmehigher.com/services/content-ads priority: 0.8 monthly
https://rankmehigher.com/services/ads-content priority: 0.8 monthly
https://rankmehigher.com/localmapbooster     priority: 0.8  monthly
https://rankmehigher.com/contact             priority: 0.8  monthly
https://rankmehigher.com/careers             priority: 0.7  weekly
https://rankmehigher.com/blog                priority: 0.8  weekly
```

### Issues
- ⚠️ No `lastmod` dates on any URL
- ⚠️ `/services/content-ads` and `/services/ads-content` appear to be duplicate routes
- ❌ Missing: individual blog post URLs
- ❌ Missing: `/privacy`, `/terms`
- ❌ Missing: potential service area pages

---

## robots.txt Analysis

### Strengths
- Well-structured with clear allow/disallow rules ✅
- Explicitly allows all major AI crawlers ✅
- Blocks admin paths (`/dashboard`, `/agency-dashboard`, `/client-portal`, etc.) ✅
- References sitemap.xml ✅

### Issues
- AI crawler access is granted but meaningless since they receive empty HTML
- Social bot preview cards (Twitter, Facebook, LinkedIn) will only see the generic homepage meta tags

---

## Detailed Recommendations

### CRITICAL (Fix Immediately)

#### 1. Implement Server-Side Rendering
**Impact:** Fixes 80% of all issues found
**Options (in order of recommendation):**

**Option A: Migrate to Next.js** (Best long-term)
- Full SSR/SSG support out of the box
- Automatic code splitting
- Built-in image optimization
- API routes replace Express server
- Estimated effort: 2-4 weeks

**Option B: Add Prerendering** (Quickest fix)
- Use `react-snap` or `prerender.io`
- Generates static HTML for each route at build time
- Crawlers get full content without JS
- Estimated effort: 1-3 days

**Option C: Add SSR to Vite** (Middle ground)
- Use `vike` (vite-plugin-ssr)
- Keeps current Vite setup
- Adds server-side rendering capability
- Estimated effort: 1-2 weeks

#### 2. Add Static JSON-LD Schema to index.html
Even before SSR, add Organization schema directly to `index.html`:
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Rank Me Higher",
  "url": "https://rankmehigher.com",
  "description": "SEO and website solutions agency in Chicago",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Chicago",
    "addressRegion": "IL",
    "addressCountry": "US"
  },
  "sameAs": ["https://twitter.com/RankMeHigher"]
}
```

#### 3. Fix OG Image URLs
Change from relative to absolute:
```html
<meta property="og:image" content="https://rankmehigher.com/assets/logo.png" />
```

### HIGH (Fix Within 1 Week)

#### 4. Add Security Headers
In Express or via Google Cloud config:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

#### 5. Remove X-Powered-By Header
```js
app.disable('x-powered-by');
```

#### 6. Add lastmod Dates to Sitemap
Update sitemap.xml with actual last-modified dates for each URL.

#### 7. Remove Duplicate Sitemap Entry
`/services/content-ads` and `/services/ads-content` — pick one canonical URL.

#### 8. Create llms.txt
Add `/llms.txt` for AI crawler discoverability:
```
# Rank Me Higher
> Professional SEO and website creation agency based in Chicago

## Services
- [Website Creation](https://rankmehigher.com/services/websites)
- [SEO Services](https://rankmehigher.com/services/seo)
- [Content & Ads](https://rankmehigher.com/services/content-ads)
- [Outbound Sales](https://rankmehigher.com/services/outbound)
- [Local Map Booster](https://rankmehigher.com/localmapbooster)

## Blog
- [SEO Blog](https://rankmehigher.com/blog)

## Contact
- [Contact Us](https://rankmehigher.com/contact)
```

### MEDIUM (Fix Within 1 Month)

#### 9. Add Blog Posts to Sitemap
Individual blog post URLs should be in sitemap.xml with lastmod dates.

#### 10. Create About/Team Page
Important for E-E-A-T — show team expertise, credentials, experience.

#### 11. Add Testimonials/Case Studies Page
Verifiable client results strengthen authoritativeness signals.

#### 12. Add FAQ Schema to Service Pages
FAQ sections already exist in React code — add `FAQPage` JSON-LD.

#### 13. Clean Up Duplicate Files
Remove all `" 2.tsx"` files (e.g., `Index 2.tsx`, `Contact 2.tsx`) — 30+ duplicates found.

### LOW (Backlog)

#### 14. Add BreadcrumbList Schema
Helps search engines understand site hierarchy.

#### 15. Implement HTML Caching
Set appropriate `Cache-Control` headers for static assets.

#### 16. Add Privacy/Terms to Sitemap
Include `/privacy` and `/terms` pages.

---

*Report generated by Claude SEO Audit — March 13, 2026*
