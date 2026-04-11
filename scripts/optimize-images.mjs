import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const QUALITY = 80;
const dirs = ['public/images', 'public/images/blog', 'public/assets', 'public'];

async function optimizeDir(dir) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    console.log(`Skipping ${dir} (not found)`);
    return;
  }

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') continue;

    const baseName = path.join(dir, path.basename(file, ext));
    const webpPath = baseName + '.webp';

    // Skip if webp already exists and is newer than source
    try {
      const webpStat = await stat(webpPath);
      if (webpStat.mtimeMs > fileStat.mtimeMs) {
        console.log(`SKIP (already exists): ${webpPath}`);
        continue;
      }
    } catch {
      // webp doesn't exist yet, proceed
    }

    try {
      const info = await sharp(filePath)
        .webp({ quality: QUALITY })
        .toFile(webpPath);
      
      const originalSize = (fileStat.size / 1024).toFixed(0);
      const newSize = (info.size / 1024).toFixed(0);
      const savings = (100 - (info.size / fileStat.size) * 100).toFixed(1);
      console.log(`CONVERTED: ${filePath} (${originalSize}KB) -> ${webpPath} (${newSize}KB) [${savings}% smaller]`);
    } catch (err) {
      console.error(`ERROR: ${filePath}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('Starting image optimization...\n');
  for (const dir of dirs) {
    await optimizeDir(dir);
  }
  console.log('\nDone!');
}

main();
