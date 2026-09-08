// Shared post loader for the writing index. getStaticPaths is compiled into a
// separate module where frontmatter bindings are out of scope, so the full
// post list must come from an importable helper (same pattern as lib/topics.ts
// for the topics routes). Both the RU and EN writing pages call this.
import { getCollection } from 'astro:content';

// Posts per writing-index page (REQ-033). Lives here, not in the page
// frontmatter, because getStaticPaths only sees imported bindings.
export const PER_PAGE = 10;

export async function loadPosts(collection: 'posts' | 'posts-en') {
  return (await getCollection(collection, (p) => !p.data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}
