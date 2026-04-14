/**
 * Post-build script: create per-route HTML shells with correct meta tags.
 *
 * For SEO-critical public pages, this creates dist/{route}/index.html files
 * with the correct <title> and <meta name="description"> baked in, so crawlers
 * that don't execute JavaScript still see the right metadata.
 *
 * The server.js already checks for these pre-rendered files and serves them.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

// Route-specific metadata for SEO-critical public pages
const ROUTE_META = {
  '/services/websites': {
    title: 'Custom Websites with AI Receptionist | 2 Week Delivery | Rank Me Higher',
    description: 'Get a custom-built website with AI receptionist, automated follow-ups, and full CRM integration. From scratch to live in 2 weeks. Book your free consultation.',
  },
  '/services/seo': {
    title: 'SEO Services | Page 1 Google Rankings Guaranteed | Rank Me Higher',
    description: 'Organic SEO, local SEO, and Google Maps optimization. Page 1 rankings guaranteed or you don\'t pay. Chicago SEO agency serving businesses nationwide.',
  },
  '/services/content-ads': {
    title: 'Content & Ads | Video Production, Google Ads, Meta Ads | Rank Me Higher',
    description: 'Professional video content creation, Google Ads, and Meta Ads campaigns that fill your calendar. Full-service content and advertising from Rank Me Higher.',
  },
  '/services/outbound': {
    title: 'Outbound Sales | Database Reactivation & Cold Outreach | Rank Me Higher',
    description: 'Database reactivation and cold outreach. We call your old leads and turn them into new revenue. Outbound sales services from Rank Me Higher.',
  },
  '/careers': {
    title: 'Careers at Rank Me Higher | Remote Marketing, Dev & Automation Jobs',
    description: 'Join Rank Me Higher — we\'re hiring remote talent in media buying, video editing, automation, software engineering, SEO, and sales. Apply now and work with a fast-growing Chicago digital agency.',
  },
  '/contact': {
    title: 'Contact Rank Me Higher | Free Consultation | Chicago SEO Agency',
    description: 'Get in touch with Rank Me Higher for a free consultation. Call (773) 572-4686 or book online. Chicago-based SEO and website agency.',
  },
  '/localmapbooster': {
    title: 'Local Map Booster | Google Maps Top 3 in 7 Days | Rank Me Higher',
    description: 'Get your business into the Google Maps Top 3 within 7 days or you don\'t pay. Complete Google Business Profile optimization from Rank Me Higher.',
  },
  '/blog': {
    title: 'Blog | SEO Tips, Local Marketing & AI Insights | Rank Me Higher',
    description: 'Expert insights on SEO, local marketing, Google Maps optimization, AI automation, and growing your business online. From the Rank Me Higher team.',
  },
};

function injectMeta(html, meta) {
  // Replace the default title
  let result = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title}</title>`
  );

  // Replace the default meta description (handle both self-closing and non-self-closing)
  result = result.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${meta.description}">`
  );

  // Replace og:title
  result = result.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${meta.title}">`
  );

  // Replace og:description
  result = result.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${meta.description}">`
  );

  // Replace twitter:title
  result = result.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${meta.title}">`
  );

  // Replace twitter:description
  result = result.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${meta.description}">`
  );

  return result;
}

function fixFontPreloads(html) {
  // Resolve unhashed font preload paths to actual hashed filenames in dist/assets/
  const assetsDir = path.join(DIST, 'assets');
  const assetFiles = fs.readdirSync(assetsDir);
  return html.replace(
    /href="\/assets\/((?:inter|montserrat)-latin-\d+-normal)\.woff2"/g,
    (match, baseName) => {
      const hashed = assetFiles.find(f => f.startsWith(baseName) && f.endsWith('.woff2'));
      return hashed ? `href="/assets/${hashed}"` : match;
    }
  );
}

function run() {
  // First fix font preload hashes in the main index.html
  const shellPath = path.join(DIST, 'index.html');
  let shellHtml = fs.readFileSync(shellPath, 'utf-8');
  shellHtml = fixFontPreloads(shellHtml);
  fs.writeFileSync(shellPath, shellHtml);

  let count = 0;
  for (const [route, meta] of Object.entries(ROUTE_META)) {
    const routeDir = path.join(DIST, route);
    fs.mkdirSync(routeDir, { recursive: true });

    const routeHtml = injectMeta(shellHtml, meta);
    fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml);
    count++;
  }

  console.log(`✅ Injected route-specific meta tags for ${count} pages`);
}

run();
