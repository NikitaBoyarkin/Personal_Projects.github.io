import { z } from 'astro/zod';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chartFileSchema, type ChartPayload } from './charts';

// Loader for src/data/github-activity.json — the automated GitHub snapshot
// written by scripts/sync-github-activity.mjs (daily via Actions). The chart
// array reuses the project chart schema so the same ChartCard components render
// it on /about; `stats` is a small, separate block for the headline numbers.
//
// When the file is absent (fresh checkout / automation disabled) the component
// renders nothing rather than failing the build.

const statsSchema = z.object({
  contributions: z.number().int().nonnegative(),
  publicRepos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  activeSince: z.number().int(),
});
export type GithubStats = z.infer<typeof statsSchema>;

const metaSchema = z.object({
  source: z.string().min(1),
  updatedAt: z.string().min(1),
  stats: statsSchema,
});

export interface GithubActivity {
  source: string;
  updatedAt: string;
  stats: GithubStats;
  charts: ChartPayload['charts'];
}

const FILE = path.join(process.cwd(), 'src', 'data', 'github-activity.json');

function fail(context: string, details: string): never {
  throw new Error(`github-activity.json ${context}:\n${details}`);
}

export function loadGithubActivity(): GithubActivity | null {
  if (!existsSync(FILE)) return null;
  const raw = JSON.parse(readFileSync(FILE, 'utf-8'));

  const meta = metaSchema.safeParse(raw);
  if (!meta.success) {
    fail('metadata failed validation', meta.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n'));
  }

  const charts = chartFileSchema.safeParse({ slug: 'github', source: raw.source, charts: raw.charts });
  if (!charts.success) {
    fail('charts failed validation', charts.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n'));
  }

  return {
    source: meta.data.source,
    updatedAt: meta.data.updatedAt,
    stats: meta.data.stats,
    charts: charts.data.charts,
  };
}
