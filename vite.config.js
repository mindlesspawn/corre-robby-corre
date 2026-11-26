import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so the built game works from any folder, static host, or inside an iOS app wrapper.
  base: './',
  server: {
    // Listen on the home network too, so a phone or tablet on the same wifi can open the game.
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
