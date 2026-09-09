import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages project site: https://mojtba-allam.github.io/FinoTicket-V1-Frontend-Implementation/
  base: process.env.GITHUB_PAGES === "true" ? "/FinoTicket-V1-Frontend-Implementation/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
