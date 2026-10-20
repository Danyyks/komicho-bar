// Gera os ícones PNG do PWA (Android, iPhone e favicon) a partir de public/favicon.svg.
// Rodar com: npm run icones
import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    // Ícone "maskable" (Android recorta em círculo/squircle): mais respiro e fundo da marca
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: "#14110E" } },
    // Ícone do iPhone: o iOS não aceita transparência, então usa o fundo da marca
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: "#14110E" } },
  },
  images: ["public/favicon.svg"],
});
