// Configuração do Vite: React, Tailwind e o PWA (manifesto + service worker).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import pacote from "./package.json" with { type: "json" };

export default defineConfig({
  // Versão do package.json disponível no app (aparece em Ajustes)
  define: { __VERSAO__: JSON.stringify(pacote.version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // "prompt": a versão nova espera o toque em "Atualizar" (componente UpdatePrompt)
      registerType: "prompt",
      includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        id: "/",
        name: "Komicho Bar",
        short_name: "Komicho",
        description: "Comandas, fiado e balanço do Komicho Bar",
        lang: "pt-BR",
        theme_color: "#14110E",
        background_color: "#14110E",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Guarda o app inteiro no aparelho para abrir mesmo sem internet
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallbackDenylist: [/^\/__/],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        // Firebase e React em arquivos próprios: mudam pouco, então o celular
        // reaproveita o cache deles quando sai uma versão nova do app
        codeSplitting: {
          groups: [
            { name: "firebase", test: /node_modules[\/](@firebase|firebase)/ },
            { name: "react", test: /node_modules[\/](react|react-dom|react-router|motion|framer-motion)[\/]/ },
          ],
        },
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
});
