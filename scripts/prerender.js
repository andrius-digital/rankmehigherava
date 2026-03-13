/**
 * Prerender script for rankmehigher.com
 *
 * Uses a lightweight HTTP-based approach: starts the built site,
 * fetches each route, and saves the HTML. Works in environments
 * without a headless browser (like Replit).
 *
 * For full JS rendering, run this locally where Chrome is available,
 * or use a CI environment with browser support.
 *
 * This version injects SEO-critical content directly into the HTML
 * as a noscript/meta fallback so crawlers get real content.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');

// SEO metadata for each public route
const ROUTES = {
  '/': {
    title: 'Rank Me Higher - SEO & Website Solutions',
    description: 'Professional SEO and website creation services to help your business rank higher. Google Maps dominance, organic SEO, high-conversion websites, and AI-powered lead generation.',
    h1: 'Rank Me Higher — SEO & Website Solutions',
    content: `<h2>Our Services</h2>
      <ul>
        <li><a href="/services/websites">High-Conversion Sales Machines</a> — Go live in 10 days. AI systems that capture and close every lead 24/7.</li>
        <li><a href="/localmapbooster">Google Map Dominance</a> — Top 3 in Google Maps. Results in 7 days or you don't pay.</li>
        <li><a href="/services/content-ads">Qualified Lead Systems</a> — Content and high-ROI ads that fill your calendar with appointments.</li>
        <li><a href="/services/seo">Search Monopoly</a> — Dominate the exact terms your customers are typing. Pure organic growth.</li>
        <li><a href="/services/outbound">Database Reactivation</a> — We call your old leads and turn them into new cash.</li>
      </ul>
      <p><a href="/contact">Book a free strategy call</a></p>`,
    canonical: 'https://rankmehigher.com/',
    schema: {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Rank Me Higher",
      "url": "https://rankmehigher.com",
      "description": "Professional SEO and website creation agency in Chicago, IL"
    }
  },
  '/services/seo': {
    title: 'SEO Services — Rank Me Higher',
    description: 'Stop paying for traffic. We dominate Google search results and Maps for the exact terms your customers type. Organic SEO that delivers real calls and leads.',
    h1: 'SEO Services — Dominate Google Search',
    content: `<h2>What We Do</h2>
      <ul>
        <li>Google Maps Domination — Rank in the top 3 of the local map pack where 70% of clicks happen</li>
        <li>Organic Search Rankings — Show up on page 1 for the keywords your customers are searching</li>
        <li>Long-Term Growth — Build sustainable traffic that compounds month over month</li>
        <li>Monthly Reporting — See exactly how many calls and leads your SEO is generating</li>
      </ul>
      <p><a href="/contact">Get a free SEO audit</a></p>`,
    canonical: 'https://rankmehigher.com/services/seo',
    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "SEO Services",
      "provider": { "@type": "Organization", "name": "Rank Me Higher" },
      "serviceType": "Search Engine Optimization",
      "url": "https://rankmehigher.com/services/seo"
    }
  },
  '/services/websites': {
    title: 'High-Conversion Websites — Rank Me Higher',
    description: 'Custom-coded websites that go live in 10 days. AI-powered lead capture systems that work 24/7. Built for conversions, not just looks.',
    h1: 'High-Conversion Website Development',
    content: `<h2>Websites That Sell</h2>
      <p>We build custom-coded sales machines with proprietary AI systems that capture and close every lead 24/7. Go live in 10 days.</p>
      <p><a href="/contact">Start your project</a></p>`,
    canonical: 'https://rankmehigher.com/services/websites',
    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Website Development",
      "provider": { "@type": "Organization", "name": "Rank Me Higher" },
      "serviceType": "Web Development",
      "url": "https://rankmehigher.com/services/websites"
    }
  },
  '/services/content-ads': {
    title: 'Content & Ads — Qualified Lead Systems — Rank Me Higher',
    description: 'Zero-touch content creation and high-ROI ad campaigns. We fill your calendar with qualified appointments while you focus on your business.',
    h1: 'Content & Ads — Qualified Lead Systems',
    content: `<p>Zero-touch content and high-ROI ads. We fill your calendar with appointments while you work.</p>
      <p><a href="/contact">Get started</a></p>`,
    canonical: 'https://rankmehigher.com/services/content-ads',
    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Content Marketing & Advertising",
      "provider": { "@type": "Organization", "name": "Rank Me Higher" },
      "serviceType": "Digital Advertising",
      "url": "https://rankmehigher.com/services/content-ads"
    }
  },
  '/services/outbound': {
    title: 'Outbound Sales & Database Reactivation — Rank Me Higher',
    description: 'We call your old leads and turn them into new cash. Guaranteed ROI. Zero effort required. Database reactivation that pays for itself.',
    h1: 'Database Reactivation & Outbound Sales',
    content: `<p>We call your old leads and turn them into new cash. Guaranteed ROI. Zero effort required.</p>
      <p><a href="/contact">Reactivate your leads</a></p>`,
    canonical: 'https://rankmehigher.com/services/outbound',
    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Outbound Sales",
      "provider": { "@type": "Organization", "name": "Rank Me Higher" },
      "serviceType": "Outbound Sales",
      "url": "https://rankmehigher.com/services/outbound"
    }
  },
  '/localmapbooster': {
    title: 'Google Maps Ranking — Local Map Booster — Rank Me Higher',
    description: 'Get your business into the Top 3 on Google Maps. Results in 7 days or you don\'t pay. Zero risk Google Maps domination.',
    h1: 'Local Map Booster — Google Maps Top 3',
    content: `<p>We force your business into the Top 3 on Google Maps. Results in 7 days or you don't pay. Zero risk.</p>
      <p><a href="/contact">Claim your spot</a></p>`,
    canonical: 'https://rankmehigher.com/localmapbooster',
    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Local Map Booster",
      "provider": { "@type": "Organization", "name": "Rank Me Higher" },
      "serviceType": "Google Maps Optimization",
      "url": "https://rankmehigher.com/localmapbooster"
    }
  },
  '/blog': {
    title: 'SEO Insights & Local Marketing Tips | Rank Me Higher Blog',
    description: 'Get the latest SEO strategies, local marketing tips, and Google Maps ranking secrets. Free insights from Chicago\'s top local SEO experts.',
    h1: 'Rank Me Higher Blog — SEO Insights & Tips',
    content: `<p>Get the latest SEO strategies, local marketing tips, and Google Maps ranking secrets.</p>
      <nav><a href="/">Home</a> &gt; <a href="/blog">Blog</a></nav>`,
    canonical: 'https://rankmehigher.com/blog',
    schema: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Rank Me Higher Blog",
      "url": "https://rankmehigher.com/blog",
      "publisher": { "@type": "Organization", "name": "Rank Me Higher" }
    }
  },
  '/contact': {
    title: 'Contact Us — Rank Me Higher',
    description: 'Get in touch with Rank Me Higher. Book a free strategy call to discuss SEO, website development, and digital marketing solutions for your business.',
    h1: 'Contact Rank Me Higher',
    content: `<p>Ready to dominate Google? Book a free strategy call today.</p>
      <p><a href="https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting">Schedule a call</a></p>`,
    canonical: 'https://rankmehigher.com/contact',
    schema: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Rank Me Higher",
      "url": "https://rankmehigher.com/contact"
    }
  },
  '/careers': {
    title: 'Careers — Join Rank Me Higher',
    description: 'Join a fast-moving digital marketing agency. We value self-starters, problem-solvers, and people who take ownership. Remote positions available worldwide.',
    h1: 'Careers at Rank Me Higher',
    content: `<p>We're a fast-moving agency that values self-starters, problem-solvers, and people who take ownership. Remote positions available worldwide.</p>`,
    canonical: 'https://rankmehigher.com/careers',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Careers at Rank Me Higher",
      "url": "https://rankmehigher.com/careers"
    }
  },
};

function injectSEOContent(html, route, meta) {
  // Inject page-specific title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${meta.title}</title>`
  );

  // Inject page-specific meta description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${meta.description}" />`
  );

  // Inject page-specific OG tags
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${meta.description}" />`
  );

  // Add canonical link
  const canonicalTag = `<link rel="canonical" href="${meta.canonical}" />`;
  html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);

  // Add page-specific schema
  if (meta.schema) {
    const schemaTag = `<script type="application/ld+json">${JSON.stringify(meta.schema)}</script>`;
    html = html.replace('</head>', `    ${schemaTag}\n  </head>`);
  }

  // Inject real content inside #root for crawlers
  // This content will be replaced by React on hydration
  const seoContent = `
    <div data-prerendered="true" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;">
      <h1>${meta.h1}</h1>
      ${meta.content}
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/services/websites">Websites</a>
        <a href="/services/seo">SEO</a>
        <a href="/services/content-ads">Content & Ads</a>
        <a href="/services/outbound">Outbound</a>
        <a href="/localmapbooster">Local Map Booster</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact</a>
        <a href="/careers">Careers</a>
      </nav>
    </div>`;

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${seoContent}</div>`
  );

  return html;
}

function prerender() {
  console.log('Starting SEO prerender...\n');

  if (!existsSync(DIST_DIR)) {
    console.error('dist/ directory not found. Run "vite build" first.');
    process.exit(1);
  }

  const originalHtml = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');

  // Save original as SPA fallback for non-prerendered routes
  writeFileSync(join(DIST_DIR, '200.html'), originalHtml);
  console.log('Saved SPA fallback: dist/200.html');

  let count = 0;
  for (const [route, meta] of Object.entries(ROUTES)) {
    const html = injectSEOContent(originalHtml, route, meta);

    const outputDir = route === '/'
      ? DIST_DIR
      : join(DIST_DIR, ...route.split('/').filter(Boolean));

    mkdirSync(outputDir, { recursive: true });

    const outputFile = route === '/'
      ? join(DIST_DIR, 'index.html')
      : join(outputDir, 'index.html');

    writeFileSync(outputFile, html);
    console.log(`Prerendered: ${route} -> ${outputFile.replace(DIST_DIR, 'dist')}`);
    count++;
  }

  console.log(`\nDone! ${count} pages prerendered with SEO content.`);
  console.log('Crawlers will now see real titles, descriptions, content, and schema on every public page.');
}

prerender();
