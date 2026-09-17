import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://nikitaboyarkin.github.io",
  base: "/Personal_Projects.github.io",
  output: "static",
  trailingSlash: "ignore",
  // v7 default is 'jsx', which strips whitespace between inline elements;
  // keep the v5/v6 boolean behaviour to avoid layout regressions.
  compressHTML: true,
  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en"],
    routing: { prefixDefaultLocale: false },
  },
  build: {
    format: "directory",
  },
  // Deep-link redirects for the consolidated about-cluster (S1.2/S1.4).
  // Old routes collapse into /about anchors; /start becomes the in-page jump nav.
  redirects: {
    "/whois/": "/about/#who",
    "/work-with-me/": "/about/#work",
    "/now/": "/about/#now",
    "/start/": "/about/#start",
    "/en/whois/": "/en/about/#who",
    "/en/work-with-me/": "/en/about/#work",
    "/en/start/": "/en/about/#start",
    // S1.3 (PRD v6): /guides/ merged into the parameterised /notes/ route.
    "/guides/": "/notes/guides/",
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "ru",
        locales: { ru: "ru-RU", en: "en-US" },
      },
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes("/404/"),
    }),
  ],
});
