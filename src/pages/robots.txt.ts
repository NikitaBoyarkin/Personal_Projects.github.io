import type { APIRoute } from "astro";
import { withBase } from "../lib/path";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() ?? "https://nikitaboyarkin.github.io/";
  const sitemap = new URL(withBase("sitemap-index.xml"), siteUrl).toString();
  const cvPdf = new URL(withBase("CV-Nikita-Boyarkin.pdf"), siteUrl).pathname;
  return new Response(`User-agent: *\nAllow: /\nDisallow: ${cvPdf}\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
