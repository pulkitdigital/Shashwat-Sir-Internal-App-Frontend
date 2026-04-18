import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      // "@/" shortcut for "src/"
      // Example: import { useAuth } from "@/context/AuthContext"
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    // Proxy API calls to backend — avoids CORS in dev
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})