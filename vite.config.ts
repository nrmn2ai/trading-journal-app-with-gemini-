import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
        },
        manifest: {
          id: '/',
          name: 'NRMN2AI Trading OS',
          short_name: 'NRMN2AI',
          description: 'سیستم عامل معاملاتی و ژورنال ۶۰ روزه پراپ برای آیفون',
          theme_color: '#0c0f16',
          background_color: '#0c0f16',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'https://api.dicebear.com/7.x/shapes/svg?seed=NRMN2AI&backgroundColor=14171f&shape1Color=00f0ff&shape2Color=a855f7',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'https://api.dicebear.com/7.x/shapes/svg?seed=NRMN2AI&backgroundColor=14171f&shape1Color=00f0ff&shape2Color=a855f7',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
      {
        name: 'suppress-hmr-ws-error',
        transform(code: string, id: string) {
          if (id.includes('client.mjs') || id.includes('bundledDevClient.mjs') || id.includes('@vite/client')) {
            return code.replaceAll(
              'reject(/* @__PURE__ */ new Error("WebSocket closed without opened."));',
              'resolve();'
            );
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

