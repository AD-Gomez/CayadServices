import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://cayadservices.com/',
  integrations: [tailwind(), react(), partytown({
    config: {
      forward: ["dataLayer.push"]
    }
<<<<<<< HEAD
  }), sitemap()]
=======
  }), sitemap({
    filter: (page) => {
      const excludePages = ['/copyright-trademark', '/payment-methods/', '/quote2/', '/privacy-policy/', '/pdfs/Terms-and-Conditions.pdf', '/pdfs/Terms-of-use.pdf', '/pdfs/Cayad_shippingInstructions.pdf', '/pdfs/sample-bill-of-lading.pdf'];
      return !excludePages.includes(page);
    },
  })]
>>>>>>> d2d1f696c8c9bf01d629e91e36f71e0bb93e95d3
});