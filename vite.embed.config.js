import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

/**
 * FinoTicket L11 — embed build.
 *
 * Produces a SINGLE self-contained IIFE bundle (`fino-console.js`) that a tenant
 * loads with one <script> tag. Everything — React, Tailwind CSS, our pages — is
 * inlined, because a shadow root cannot fetch sibling assets reliably and we do
 * not want to impose a module loader on the host.
 *
 * Run with: npm run build:embed
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // No `base`: the bundle is loaded by absolute URL, not served from a folder.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist-embed",
    emptyOutDir: true,
    // A single file, so turn off chunk splitting entirely.
    cssCodeSplit: false,
    sourcemap: true,
    minify: "esbuild",
    lib: {
      entry: resolve(__dirname, "src/embed/main.tsx"),
      name: "FinoConsole",
      // IIFE so a plain <script src> works with no bundler on the host side.
      formats: ["iife"],
      fileName: () => "fino-console.js",
    },
    rollupOptions: {
      // Absolutely no externals: the bundle must run standalone.
      external: [],
      output: {
        inlineDynamicImports: true,
        assetFileNames: "fino-console.[ext]",
      },
    },
  },
});
