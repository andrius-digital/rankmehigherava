import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

/**
 * Vite plugin that injects <link rel="preload"> tags for critical
 * Latin-subset web fonts (Inter, Orbitron, Montserrat) into the
 * built index.html.  This eliminates the FOUT/CLS caused by fonts
 * loading only after the CSS is parsed.
 *
 * NOTE: CSS deferral has been intentionally removed — deferring the
 * main stylesheet caused fonts and layout to render incorrectly on
 * first paint because the @fontsource CSS rules were not yet applied.
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

      // Critical weights: Inter 400/500/600, Montserrat 400/600/700, Orbitron 400/700/800/900
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
