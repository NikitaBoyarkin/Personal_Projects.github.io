import type { APIRoute } from 'astro';
import { withBase } from '../lib/path';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() ?? 'https://nikitaboyarkin.github.io/';
  const sitemap = new URL(withBase('sitemap.xml'), siteUrl).toString();
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
};
