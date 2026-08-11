import { defineConfig } from "astro/config";

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
});