# SEO Action Plan: rankmehigher.com

## Priority: CRITICAL (Fix Immediately)

- [ ] **Implement prerendering or SSR** — Your #1 issue. Search engines see empty pages.
  - Fastest fix: Add `react-snap` for static prerendering (1-3 days)
  - Best fix: Migrate to Next.js (2-4 weeks)
- [ ] **Add static JSON-LD schema** to `index.html` (Organization + LocalBusiness)
- [ ] **Fix OG image URLs** — Change from `/assets/logo.png` to `https://rankmehigher.com/assets/logo.png`

## Priority: HIGH (This Week)

- [ ] **Remove `X-Powered-By: Express`** header — `app.disable('x-powered-by')`
- [ ] **Add security headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] **Add `lastmod` dates** to all sitemap.xml entries
- [ ] **Fix duplicate sitemap entry** — `/services/content-ads` vs `/services/ads-content`
- [ ] **Create `llms.txt`** file for AI crawler discoverability

## Priority: MEDIUM (This Month)

- [ ] **Add individual blog posts** to sitemap.xml
- [ ] **Create About/Team page** — critical for E-E-A-T
- [ ] **Add testimonials/case studies page** — prove expertise
- [ ] **Add FAQPage schema** to service pages
- [ ] **Clean up 30+ duplicate `" 2.tsx"` files** in source code

## Priority: LOW (Backlog)

- [ ] Add BreadcrumbList schema to all pages
- [ ] Implement HTML caching strategy
- [ ] Add `/privacy` and `/terms` to sitemap
- [ ] Set up IndexNow for faster indexing
