import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // ✅ Let Vite prebundle leaflet-draw properly
    include: ["leaflet", "leaflet-draw"],
  },
  build: {
    commonjsOptions: {
      // ✅ Ensure CommonJS modules like leaflet-draw are handled
      include: [/node_modules/, /leaflet-draw/],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});