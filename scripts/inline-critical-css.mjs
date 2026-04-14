/**
 * Post-build script: inline critical CSS and async-load the full stylesheet.
 *
 * This replaces the render-blocking <link rel="stylesheet"> with:
 *   1. An inlined <style> block containing critical above-the-fold CSS
 *   2. A <link rel="preload" as="style" onload="..."> that async-loads the full CSS
 *   3. A <noscript> fallback for non-JS environments
 *
 * This eliminates the 2,580ms render-blocking CSS issue on mobile.
 */
import Critters from 'critters';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

async function run() {
  const htmlPath = path.join(DIST, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  const critters = new Critters({
    path: DIST,
    // Inline critical CSS and async-load the rest via media=print pattern
    preload: 'media',
    // Don't inline font-face declarations (they're already swap)
    inlineFonts: false,
    // Don't remove unused CSS from the external file
    pruneSource: false,
    // Compress the inlined CSS
    compress: true,
    // Log what's happening
    logLevel: 'info',
  });

  let result = await critters.process(html);

  // Fix noscript fallback: remove media=print and onload from the noscript link
  result = result.replace(
    /<noscript><link rel="stylesheet" crossorigin href="([^"]+)" media="print" onload="this\.media='all'"><\/noscript>/g,
    '<noscript><link rel="stylesheet" crossorigin href="$1"></noscript>'
  );

  fs.writeFileSync(htmlPath, result);

  // Also process 404.html if it exists
  const notFoundPath = path.join(DIST, '404.html');
  if (fs.existsSync(notFoundPath)) {
    const notFoundHtml = fs.readFileSync(notFoundPath, 'utf-8');
    const notFoundResult = await critters.process(notFoundHtml);
    fs.writeFileSync(notFoundPath, notFoundResult);
  }

  console.log('✅ Critical CSS inlined successfully');
}

run().catch(err => {
  console.error('Critical CSS inlining failed:', err);
  process.exit(1);
});
