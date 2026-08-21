import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://nikitaboyarkin.github.io",
  base: "/Personal_Projects.github.io",
  output: "static",
  trailingSlash: "ignore",
  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en"],
    routing: { prefixDefaultLocale: false },
  },
  build: {
    format: "directory",
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