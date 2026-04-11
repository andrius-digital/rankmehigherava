/**
 * Generate responsive image variants for srcset.
 *
 * For each source WebP image that is wider than 800px, this script
 * creates 400w, 800w, and 1200w variants alongside the original.
 *
 * Output naming: image-400w.webp, image-800w.webp, image-1200w.webp
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "..", "public");

const WIDTHS = [400, 800, 1200];

// Images that need srcset variants (large images displayed responsively)
const IMAGES = [
  "off-tint-screenshot.webp",
  "images/portfolio-lts-mechanical.webp",
  "images/portfolio-pro-repair.webp",
  "images/custom-coded-website-example.webp",
  "images/template-website-example.webp",
  "images/portfolio-chicago-valley.webp",
  "images/portfolio-midwest-express.webp",
  "images/portfolio-paddock-parking.webp",
  "images/portfolio-property-refresh-maids.webp",
  "images/portfolio-qtatax.webp",
  "assets/map-pack-preview.webp",
  "assets/seo-results-collage.webp",
  "images/blog/clean-code-editor.webp",
  "images/blog/custom-coded-hero.webp",
  "images/blog/local-business-digital-presence.webp",
  "images/blog/template-vs-custom-performance.webp",
];

async function generateVariants(relPath) {
  const fullPath = path.join(PUBLIC, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`   ⏭  Skipping (not found): ${relPath}`);
    return;
  }

  const meta = await sharp(fullPath).metadata();
  const baseName = path.basename(relPath, path.extname(relPath));
  const dir = path.dirname(fullPath);

  for (const w of WIDTHS) {
    if (w >= meta.width) {
      // No point creating a variant wider than the original
      continue;
    }

    const outName = `${baseName}-${w}w.webp`;
    const outPath = path.join(dir, outName);

    if (fs.existsSync(outPath)) {
      // Already generated
      continue;
    }

    await sharp(fullPath)
      .resize(w)
      .webp({ quality: 80 })
      .toFile(outPath);

    const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`   ✅ ${path.join(path.dirname(relPath), outName)} (${sizeKB} KB)`);
  }
}

async function main() {
  console.log("🖼  Generating responsive image variants...\n");

  for (const img of IMAGES) {
    await generateVariants(img);
  }

  console.log("\n🎉 Done generating srcset variants.\n");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
