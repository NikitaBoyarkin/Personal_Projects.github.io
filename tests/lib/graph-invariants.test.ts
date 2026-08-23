// Graph invariants against the REAL content collections on disk. These guard
// against a graph that silently degrades as content grows: orphan nodes,
// missing URLs, unweighted edges, or duplicate edges.
import { describe, it, expect, beforeAll } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { buildGraph, parseRelatedPath, type GraphData } from '../../src/lib/graph';
import { TOPICS } from '../../src/lib/topics';

const CONTENT = join(__dirname, '..', '..', 'src', 'content');

function loadCollection(name: string): { id: string; data: Record<string, unknown> }[] {
  const dir = join(CONTENT, name);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = readFileSync(join(dir, f), 'utf-8');
      // Strip the frontmatter fence, keep the YAML block only.
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const data = (m ? parseYaml(m[1]) : {}) as Record<string, unknown>;
      return { id: f, data };
    });
}

let graphs: { ru: GraphData; en: GraphData };

beforeAll(() => {
  const projects = loadCollection('projects');
  const projectsEn = loadCollection('projects-en');
  const posts = loadCollection('posts');
  const postsEn = loadCollection('posts-en');
  const parts = loadCollection('volta-parts');
  const partsEn = loadCollection('volta-parts-en');

  graphs = {
    ru: buildGraph({ projects, posts, parts, topics: TOPICS, lang: 'ru' }),
    en: buildGraph({ projects: projectsEn, posts: postsEn, parts: partsEn, topics: TOPICS, lang: 'en' }),
  };
});

function invariants(name: string, getGraph: () => GraphData) {
  describe(`invariants — ${name} graph`, () => {
    it('has no orphan (disconnected) nodes', () => {
      const g = getGraph();
      const connected = new Set<string>();
      for (const l of g.links) {
        connected.add(l.source);
        connected.add(l.target);
      }
      const orphans = g.nodes.filter((n) => !connected.has(n.id)).map((n) => n.id);
      expect(orphans).toEqual([]);
    });

    it('gives every node a non-empty url', () => {
      const g = getGraph();
      for (const n of g.nodes) {
        expect(n.url, `node ${n.id}`).toBeTruthy();
      }
    });

    it('gives every edge a weight in (0,1] and a known type', () => {
      const g = getGraph();
      for (const l of g.links) {
        expect(l.weight, `edge ${l.source}→${l.target}`).toBeGreaterThan(0);
        expect(l.weight, `edge ${l.source}→${l.target}`).toBeLessThanOrEqual(1);
        expect(['related', 'children', 'topic', 'shared']).toContain(l.type);
      }
    });

    it('has no duplicate or self edges', () => {
      const g = getGraph();
      const seen = new Set<string>();
      for (const l of g.links) {
        expect(l.source, 'self-edge').not.toBe(l.target);
        const key = [l.source, l.target].sort().join('\u0000');
        expect(seen.has(key), `duplicate edge ${l.source}—${l.target}`).toBe(false);
        seen.add(key);
      }
    });

    it('references only existing nodes', () => {
      const g = getGraph();
      const ids = new Set(g.nodes.map((n) => n.id));
      for (const l of g.links) {
        expect(ids.has(l.source), `missing source ${l.source}`).toBe(true);
        expect(ids.has(l.target), `missing target ${l.target}`).toBe(true);
      }
    });

    it('produces at least one node and one edge', () => {
      const g = getGraph();
      expect(g.nodes.length).toBeGreaterThan(0);
      expect(g.links.length).toBeGreaterThan(0);
    });
  });
}

invariants('ru', () => graphs.ru);
invariants('en', () => graphs.en);

describe('real-content related parsing', () => {
  it('every /projects/ and /posts/ related entry resolves to a real slug', () => {
    for (const coll of ['projects', 'projects-en', 'posts', 'posts-en']) {
      const entries = loadCollection(coll);
      for (const entry of entries) {
        const related = (entry.data.related as unknown[] | undefined) ?? [];
        for (const rel of related) {
          const parsed = typeof rel === 'string' ? parseRelatedPath(rel) : null;
          if (!parsed) continue;
          // A related target may live in either locale (e.g. an EN project
          // linking to a RU-only post) — the link just needs to exist somewhere.
          const candidates = parsed.type === 'project'
            ? [...loadCollection('projects'), ...loadCollection('projects-en')]
            : [...loadCollection('posts'), ...loadCollection('posts-en')];
          expect(
            candidates.some((t) => basename(t.id) === `${parsed.slug}.md`),
            `${entry.id} → unresolved ${rel}`,
          ).toBe(true);
        }
      }
    }
  });
});