import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const BASE = '/lofinibo';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', (p) => !p.data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: 'Nikita Boyarkin — Writing',
    description: 'Articles on product analytics, A/B testing, and data science by Nikita Boyarkin.',
    site: context.site ?? 'https://nikitaboyarkin.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.date,
      link: `${BASE}/posts/${post.id.replace(/\.md$/, '')}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}