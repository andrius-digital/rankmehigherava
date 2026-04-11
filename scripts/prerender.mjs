/**
 * Post-build pre-rendering script.
 *
 * After `vite build` produces dist/ (with font preloads and CSS defer
 * already injected by the Vite plugin), this script:
 *
 *   1. Reads the built dist/index.html as the template
 *   2. Starts a lightweight static server on dist/
 *   3. Visits each public route with Puppeteer
 *   4. Extracts the Helmet-injected <title>, <meta name="description">,
 *      <link rel="canonical">, and the rendered <div id="root"> content
 *   5. Patches those into the template and writes per-route HTML files
 *
 * This preserves font preloads, CSS defer, schema markup, etc. from
 * the original template while giving each route unique SEO metadata
 * and pre-rendered body content.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const PORT = 4173;

// ── Public routes to pre-render ──────────────────────────────────
const ROUTES = [
  "/",
  "/localmapbooster",
  "/services/websites",
  "/services/seo",
  "/services/content-ads",
  "/services/ads-content",
  "/services/outbound",
  "/blog",
  "/blog/google-maps-ranking-2025",
  "/blog/local-seo-vs-organic-seo",
  "/blog/review-generation-strategies",
  "/blog/google-business-profile-mistakes",
  "/blog/ai-seo-future",
  "/blog/service-business-website-tips",
  "/blog/custom-coded-websites-local-businesses-2026",
  "/contact",
  "/careers",
  "/privacy",
  "/terms",
];

// Also pre-render a dedicated 404 page
const ROUTE_404 = "/__404__";

// ── Minimal static file server with SPA fallback ─────────────────
function createServer() {
  return http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    let filePath = path.join(DIST, urlPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return sendFile(filePath, res);
    }

    const indexPath = path.join(filePath, "index.html");
    if (fs.existsSync(indexPath)) {
      return sendFile(indexPath, res);
    }

    return sendFile(path.join(DIST, "index.html"), res);
  });
}

function sendFile(filePath, res) {
  const ext = path.extname(filePath);
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".svg": "image/svg+xml",
  };
  res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(res);
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Starting pre-render...\n");

  // Read the template (already has font preloads, CSS defer, schema, etc.)
  const template = fs.readFileSync(path.join(DIST, "index.html"), "utf-8");

  // Start server
  const server = createServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`   Static server on http://localhost:${PORT}`);

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const allRoutes = [...ROUTES, ROUTE_404];
  let successCount = 0;

  for (const route of allRoutes) {
    const url =
      route === ROUTE_404
        ? `http://localhost:${PORT}/this-page-does-not-exist-404-test`
        : `http://localhost:${PORT}${route}`;

    try {
      const page = await browser.newPage();

      // Block heavy resources to speed up rendering
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (["image", "media"].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // Wait for Helmet to inject the title
      await page
        .waitForFunction(
          () => {
            const title = document.title;
            return (
              title && title !== "Rank Me Higher - SEO & Website Solutions"
            );
          },
          { timeout: 5000 }
        )
        .catch(() => {});

      // Small extra wait for remaining Helmet updates
      await new Promise((r) => setTimeout(r, 500));

      // Extract Helmet-injected metadata from the page
      const metadata = await page.evaluate(() => {
        const title = document.querySelector("title")?.outerHTML || "";
        const desc =
          document
            .querySelector('meta[name="description"][data-rh="true"]')
            ?.outerHTML || "";
        const canonical =
          document
            .querySelector('link[rel="canonical"][data-rh="true"]')
            ?.outerHTML || "";
        const ogTags = Array.from(
          document.querySelectorAll('meta[property^="og:"][data-rh="true"]')
        )
          .map((el) => el.outerHTML)
          .join("\n    ");
        const twitterTags = Array.from(
          document.querySelectorAll('meta[name^="twitter:"][data-rh="true"]')
        )
          .map((el) => el.outerHTML)
          .join("\n    ");
        const robotsMeta =
          document
            .querySelector('meta[name="robots"][data-rh="true"]')
            ?.outerHTML || "";
        const prerenderStatus =
          document
            .querySelector(
              'meta[name="prerender-status-code"][data-rh="true"]'
            )
            ?.outerHTML || "";

        // Get the rendered body content
        const rootEl = document.getElementById("root");
        const bodyContent = rootEl ? rootEl.innerHTML : "";

        return {
          title,
          desc,
          canonical,
          ogTags,
          twitterTags,
          robotsMeta,
          prerenderStatus,
          bodyContent,
        };
      });

      // Build the pre-rendered HTML from the template
      let html = template;

      // Replace the default title with the page-specific title
      if (metadata.title) {
        html = html.replace(
          /<title>Rank Me Higher - SEO &amp; Website Solutions<\/title>|<title>Rank Me Higher - SEO & Website Solutions<\/title>/,
          metadata.title
        );
      }

      // Replace the default meta description
      if (metadata.desc) {
        html = html.replace(
          /<meta name="description" content="Chicago AI website agency\.[^"]*" \/>/,
          metadata.desc
        );
      }

      // Inject canonical tag (add before </head> if not already present)
      if (metadata.canonical) {
        // Remove any existing canonical from template
        html = html.replace(/<link rel="canonical"[^>]*>\s*/g, "");
        // Add the page-specific canonical before </head>
        html = html.replace("</head>", `    ${metadata.canonical}\n  </head>`);
      }

      // Inject robots meta if present (e.g., noindex for 404)
      if (metadata.robotsMeta) {
        html = html.replace("</head>", `    ${metadata.robotsMeta}\n  </head>`);
      }

      // Inject prerender status code if present
      if (metadata.prerenderStatus) {
        html = html.replace(
          "</head>",
          `    ${metadata.prerenderStatus}\n  </head>`
        );
      }

      // Replace OG tags if Helmet provided page-specific ones
      if (metadata.ogTags) {
        // Remove template OG tags
        html = html.replace(
          /<meta property="og:title"[^>]*\/>\s*/g,
          ""
        );
        html = html.replace(
          /<meta property="og:description"[^>]*\/>\s*/g,
          ""
        );
        html = html.replace(/<meta property="og:url"[^>]*\/>\s*/g, "");
        // Add page-specific OG tags
        html = html.replace("</head>", `    ${metadata.ogTags}\n  </head>`);
      }

      // Inject pre-rendered body content into the root div
      if (metadata.bodyContent) {
        html = html.replace(
          '<div id="root"></div>',
          `<div id="root">${metadata.bodyContent}</div>`
        );
      }

      // Determine output path
      let outDir, outFile;
      if (route === ROUTE_404) {
        outDir = DIST;
        outFile = path.join(DIST, "404.html");
      } else if (route === "/") {
        outDir = DIST;
        outFile = path.join(DIST, "index.html");
      } else {
        outDir = path.join(DIST, route);
        outFile = path.join(outDir, "index.html");
      }

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, html, "utf-8");

      // Verify
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/);
      const pageTitle = titleMatch ? titleMatch[1] : "(no title)";
      console.log(`   ✅ ${route.padEnd(55)} → ${pageTitle}`);
      successCount++;

      await page.close();
    } catch (err) {
      console.error(`   ❌ ${route}: ${err.message}`);
    }
  }

  await browser.close();
  server.close();

  console.log(
    `\n🎉 Pre-rendered ${successCount}/${allRoutes.length} routes.\n`
  );
}

main().catch((err) => {
  console.error("Pre-render failed:", err);
  process.exit(1);
});
