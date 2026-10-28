// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://btreiner.com',
  trailingSlash: 'always',
  integrations: [mdx()],
  fonts: [
    {
      name: 'Piazzolla',
      cssVariable: '--font-heading',
      provider: fontProviders.local(),
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          { weight: 500, style: 'normal', src: ['./src/fonts/piazzolla-500.woff2'] },
          { weight: 700, style: 'normal', src: ['./src/fonts/piazzolla-700.woff2'] },
        ],
      },
    },
    {
      name: 'Alegreya Sans',
      cssVariable: '--font-body',
      provider: fontProviders.local(),
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          { weight: 400, style: 'normal', src: ['./src/fonts/alegreya-sans-400.woff2'] },
          { weight: 400, style: 'italic', src: ['./src/fonts/alegreya-sans-400-italic.woff2'] },
          { weight: 700, style: 'normal', src: ['./src/fonts/alegreya-sans-700.woff2'] },
        ],
      },
    },
  ],
});
