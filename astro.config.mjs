import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: 'https://ad-gomez.github.io',
  base: '/docs',
  integrations: [tailwind(), react(), partytown()]
});