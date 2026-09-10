// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  server: {
    host: true,
    port: 4321, // Astro varsayılan portu, ngrok hangi portu dinliyorsa o olmalı
  },
  vite: {
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  devToolbar: { enabled: false },
});
