import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://nikitaboyarkin.github.io',
  base: '/Personal_Projects.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
