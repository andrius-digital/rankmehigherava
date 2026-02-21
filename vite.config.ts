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
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      overlay: true,
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://vyviopkpwcsdrfpdwzpa.supabase.co'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dmlvcGtwd2NzZHJmcGR3enBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MDI0NjUsImV4cCI6MjA4MjQ3ODQ2NX0.-0fLKWyJ39io9kTmV0Y9vg_sCeKBHy5Ct4c2FgEqHOw'),
    'import.meta.env.VITE_VAPI_PUBLIC_KEY': JSON.stringify('019854eb-7bad-4c5f-b732-9f684594d13b'),
    'import.meta.env.VITE_VAPI_ASSISTANT_ID': JSON.stringify('8b568760-0a05-46e5-812f-613f23309400'),
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(''), // Add your OpenAI API key here for embeddings
  },
}));
