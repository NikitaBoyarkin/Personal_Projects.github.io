import { describe, it, expect } from 'vitest';
import { buildGraph, parseRelatedPath } from '../../src/lib/graph';
import { TOPICS } from '../../src/lib/topics';

const project = (
  slug: string,
  extra: Partial<{ track: string; related: string[]; children: string[]; tools: string[]; description: string; title: string }> = {},
) => ({
  id: `${slug}.md`,
  data: {
    title: extra.title ?? slug,
    track: extra.track,
    related: extra.related ?? [],
    children: extra.children ?? [],
    tools: extra.tools ?? [],
    description: extra.description ?? '',
  },
});

const post = (
  slug: string,
  extra: Partial<{ category: string; tags: string[]; related: string[]; title: string }> = {},
) => ({
  id: `${slug}.md`,
  data: {
    title: extra.title ?? slug,
    category: extra.category ?? 'note',
    tags: extra.tags ?? [],
    related: extra.related ?? [],
  },
});

describe('parseRelatedPath', () => {
  it('parses project and post paths in both locales', () => {
    expect(parseRelatedPath('/projects/volta/')).toEqual({ type: 'project', slug: 'volta' });
    expect(parseRelatedPath('/en/projects/volta/')).toEqual({ type: 'project', slug: 'volta' });
    expect(parseRelatedPath('/posts/bayesian-ab-testing/')).toEqual({ type: 'post', slug: 'bayesian-ab-testing' });
    expect(parseRelatedPath('/en/posts/x/')).toEqual({ type: 'post', slug: 'x' });
  });

  it('rejects external URLs and non-project/post paths', () => {
    expect(parseRelatedPath('https://github.com/foo/bar')).toBeNull();
    expect(parseRelatedPath('/topics/sql/')).toBeNull();
    expect(parseRelatedPath('/posts/')).toBeNull();
  });
});

describe('buildGraph', () => {
  it('creates nodes for projects, posts, parts and topics with expected groups', () => {
    const g = buildGraph({
      projects: [project('volta', { track: 'experiments' })],
      posts: [post('ab-calibration', { category: 'guide', tags: ['ab-testing'] })],
      parts: [{ id: 'funnel.md', data: { title: 'Funnel' } }],
      topics: TOPICS,
      lang: 'ru',
    });
    expect(g.nodes.find((n) => n.id === 'p:volta')?.group).toBe('experiments');
    expect(g.nodes.find((n) => n.id === 'post:ab-calibration')?.group).toBe('guide');
    expect(g.nodes.find((n) => n.id === 'vp:funnel')?.group).toBe('experiments');
    expect(g.nodes.find((n) => n.id === 'topic:ab-testing')?.label).toBe('A/B-тестирование');
  });

  it('uses english topic keys as labels in en mode', () => {
    const g = buildGraph({
      projects: [project('volta', { description: 'ab testing methodology' })],
      posts: [],
      parts: [],
      topics: TOPICS,
      lang: 'en',
    });
    expect(g.nodes.find((n) => n.id === 'topic:ab-testing')?.label).toBe('ab-testing');
  });

  it('drops topic nodes that have no edges in a locale', () => {
    const g = buildGraph({
      projects: [],
      posts: [],
      parts: [],
      topics: TOPICS,
      lang: 'en',
    });
    expect(g.nodes.some((n) => n.id.startsWith('topic:'))).toBe(false);
  });

  it('links projects via related and volta children', () => {
    const g = buildGraph({
      projects: [
        project('volta', { children: ['funnel', 'ab'] }),
        project('ab', { related: ['/projects/volta/'] }),
      ],
      posts: [],
      parts: [
        { id: 'funnel.md', data: { title: 'Funnel' } },
        { id: 'ab.md', data: { title: 'AB' } },
      ],
      topics: TOPICS,
    });
    const keys = g.links.map((l) => [l.source, l.target].sort().join('|'));
    expect(keys).toContain('p:ab|p:volta');
    expect(keys).toContain('p:volta|vp:funnel');
    expect(keys).toContain('p:volta|vp:ab');
  });

  it('dedupes reversed edges', () => {
    const g = buildGraph({
      projects: [
        project('a', { related: ['/projects/b/'] }),
        project('b', { related: ['/projects/a/'] }),
      ],
      posts: [],
      parts: [],
      topics: TOPICS,
    });
    const ab = g.links.filter(
      (l) => [l.source, l.target].sort().join('|') === 'p:a|p:b',
    );
    expect(ab).toHaveLength(1);
  });

  it('links posts to topics by tag', () => {
    const g = buildGraph({
      projects: [],
      posts: [post('x', { tags: ['retention', 'cohort-analysis'] })],
      parts: [],
      topics: TOPICS,
    });
    expect(g.links.some((l) => l.source === 'post:x' && l.target === 'topic:retention')).toBe(true);
  });

  it('does not create dangling edges to missing nodes', () => {
    const g = buildGraph({
      projects: [project('a', { related: ['/projects/missing/', '/posts/ghost/'] })],
      posts: [],
      parts: [],
      topics: TOPICS,
    });
    const dangling = g.links.filter((l) => l.source === 'p:a');
    expect(dangling).toHaveLength(0);
  });
});