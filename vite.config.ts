import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

/**
 * Vite plugin that:
 * 1. Injects <link rel="preload"> for critical Latin web fonts
 * 2. Converts the main CSS to a non-render-blocking preload pattern
 *
 * Uses the closeBundle hook to post-process dist/index.html after
 * all assets are written, so we can scan the actual font files on disk.
 */
function fontPreloadPlugin(): Plugin {
  return {
    name: "font-preload",
    enforce: "post",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(distDir, "index.html");
      if (!fs.existsSync(indexPath)) return;

      let html = fs.readFileSync(indexPath, "utf-8");

      // Scan dist/assets for font files
      const assetsDir = path.join(distDir, "assets");
      if (!fs.existsSync(assetsDir)) return;

      const allFiles = fs.readdirSync(assetsDir);
      const fontFiles = allFiles.filter(
        (f) =>
          f.endsWith(".woff2") &&
          /(inter|orbitron|montserrat)-latin-\d+/.test(f)
      );

      // Critical weights
      const criticalPatterns = [
        "inter-latin-400-normal",
        "inter-latin-500-normal",
        "inter-latin-600-normal",
        "montserrat-latin-400-normal",
        "montserrat-latin-600-normal",
        "montserrat-latin-700-normal",
        "orbitron-latin-400-normal",
        "orbitron-latin-700-normal",
        "orbitron-latin-800-normal",
        "orbitron-latin-900-normal",
      ];

      const preloadTags = fontFiles
        .filter((f) => criticalPatterns.some((p) => f.includes(p)))
        .map(
          (f) =>
            `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`
        )
        .join("\n    ");

      if (preloadTags) {
        html = html.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n    ${preloadTags}`
        );
        console.log(
          `\n🔤 Font preload: injected ${
            preloadTags.split("\n").length
          } preload tags`
        );
      }

      // Convert main CSS to non-render-blocking preload pattern
      const cssLinkRegex =
        /<link rel="stylesheet" crossorigin href="(\/assets\/index-[^"]+\.css)">/;
      const cssMatch = html.match(cssLinkRegex);
      if (cssMatch) {
        const cssHref = cssMatch[1];
        const replacement = [
          `<link rel="preload" href="${cssHref}" as="style" crossorigin>`,
          `<link rel="stylesheet" href="${cssHref}" crossorigin media="print" onload="this.media='all'">`,
          `<noscript><link rel="stylesheet" href="${cssHref}" crossorigin></noscript>`,
        ].join("\n    ");
        html = html.replace(cssMatch[0], replacement);
        console.log(`🎨 CSS defer: converted main CSS to non-blocking preload`);
      }

      fs.writeFileSync(indexPath, html, "utf-8");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), fontPreloadPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      overlay: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
}));
