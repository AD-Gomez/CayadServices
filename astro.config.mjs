import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";


// https://astro.build/config
export default defineConfig({
  site: 'https://cayadservices.com/',
  // Only enable Partytown in production builds. In dev mode Partytown
  // proxies certain browser APIs (including Image.src) which can cause
  // repeated fetch/revalidation when components re-mount. Disabling it
  // during development prevents those side effects and makes debugging
  // easier. If you rely on Partytown in production, it will still be
  // included there.
  integrations: [
    tailwind(),
    react(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          partytown({
            config: {
              forward: ["dataLayer.push"],
            },
          }),
        ]
      : []),
    sitemap(),
  ],
  // Vite dev server tweaks: force re-optimize deps to avoid stale cache issues
  vite: {
    optimizeDeps: {
      // Force dependency pre-bundling on dev start, helps resolve
      // "Outdated Optimize Dep" 504 and hydration failures.
      force: true,
    },
  }
});