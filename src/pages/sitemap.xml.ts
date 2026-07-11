import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { withBase } from '../lib/path';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    return new Response('Missing site config', { status: 500 });
  }

  const siteUrl = site.toString().replace(/\/$/, '');

  const pages = [
    '',
    'writing/',
    'contact/',
  ];

  const projects = await getCollection('projects', (p) => !p.data.draft);
  const posts = await getCollection('posts', (p) => !p.data.draft);

  const routes = [
    ...pages.map((path) => ({ url: `${siteUrl}${withBase(path)}`, lastmod: undefined })),
    ...projects.map((p) => ({
      url: `${siteUrl}${withBase(`projects/${p.id.replace(/\.md$/, '')}/`)}`,
      lastmod: undefined,
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}${withBase(`posts/${p.id.replace(/\.md$/, '')}/`)}`,
      lastmod: p.data.date.toISOString().split('T')[0],
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    routes
      .map(
        (route) =>
          `  <url>\n` +
          `    <loc>${escapeXml(route.url)}</loc>\n` +
          (route.lastmod ? `    <lastmod>${escapeXml(route.lastmod)}</lastmod>\n` : '') +
          `  </url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
