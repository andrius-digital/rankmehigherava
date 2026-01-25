import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      // Use polling to detect file changes reliably (fixes issue on macOS)
      // This ensures changes made in Cursor are detected immediately
      usePolling: true,
      interval: 1000, // Check every second
    },
    hmr: {
      // Ensure HMR is working properly
      overlay: true,
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://vyviopkpwcsdrfpdwzpa.supabase.co'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dmlvcGtwd2NzZHJmcGR3enBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MDI0NjUsImV4cCI6MjA4MjQ3ODQ2NX0.-0fLKWyJ39io9kTmV0Y9vg_sCeKBHy5Ct4c2FgEqHOw'),
    'import.meta.env.VITE_VAPI_PUBLIC_KEY': JSON.stringify('5fcdd92d-d2a1-4b94-8189-f100ac650474'),
    'import.meta.env.VITE_VAPI_ASSISTANT_ID': JSON.stringify('your-assistant-id-here'),
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(''), // Add your OpenAI API key here for embeddings
  },
}));
