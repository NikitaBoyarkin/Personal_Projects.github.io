import { z } from 'astro/zod';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Contract for src/data/charts/<slug>.json — the payload subagents produce per
// project page. Every chart card renders as: title → description (above the
// SVG) → chart → conclusions (below). All text fields are bilingual {ru, en}.
// Business rules enforced here: conclusions must cite concrete numbers, series
// lengths must align with categories, cohort matrices must be rectangular.

export const CHART_TYPES = ['bar', 'line', 'cohort-heatmap', 'funnel', 'scatter', 'histogram'] as const;
export type ChartType = (typeof CHART_TYPES)[number];

const localized = z.object({
  ru: z.string().min(1),
  en: z.string().min(1),
});
export type LocalizedText = z.infer<typeof localized>;

const barData = z.object({
  categories: z.array(z.string()).min(1),
  series: z.array(z.object({ name: z.string(), values: z.array(z.number()) })).min(1),
});

const cohortData = z.object({
  cohorts: z.array(z.string()).min(1),
  periods: z.array(z.string()).min(1),
  values: z.array(z.array(z.number())).min(1),
  unit: z.enum(['percent', 'count']).default('percent'),
});

const funnelData = z.object({
  stages: z.array(z.object({ label: z.string(), value: z.number() })).min(1),
});

const scatterData = z.object({
  points: z.array(z.object({ x: z.number(), y: z.number(), label: z.string().optional() })).min(1),
});

const chartBody = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bar'), data: barData }),
  z.object({ type: z.literal('histogram'), data: barData }),
  z.object({ type: z.literal('line'), data: barData }),
  z.object({ type: z.literal('cohort-heatmap'), data: cohortData }),
  z.object({ type: z.literal('funnel'), data: funnelData }),
  z.object({ type: z.literal('scatter'), data: scatterData }),
]);

const chartObject = z
  .object({
    id: z.string().min(1),
    title: localized,
    description: localized,
    xLabel: localized.optional(),
    yLabel: localized.optional(),
    // Print every Nth x-axis label (bar/line only). Long series (30-day, weekly)
    // would otherwise overlap; the default prints every category.
    labelEvery: z.number().int().min(1).optional(),
    conclusions: z.array(localized).min(1),
  })
  .and(chartBody);
export type ChartObject = z.infer<typeof chartObject>;

export const chartFileSchema = z
  .object({
    slug: z.string().min(1),
    source: z.string().min(1),
    charts: z.array(chartObject).min(1),
  })
  .superRefine((file, ctx) => {
    file.charts.forEach((c, ci) => {
      c.conclusions.forEach((concl, k) => {
        if (!/\d/.test(concl.ru) || !/\d/.test(concl.en)) {
          ctx.addIssue({
            code: 'custom',
            path: ['charts', ci, 'conclusions', k],
            message: `conclusion must contain a concrete number in both locales (ru=${JSON.stringify(concl.ru)}, en=${JSON.stringify(concl.en)})`,
          });
        }
      });
      if (c.type === 'bar' || c.type === 'line' || c.type === 'histogram') {
        const n = c.data.categories.length;
        c.data.series.forEach((s, si) => {
          if (s.values.length !== n) {
            ctx.addIssue({
              code: 'custom',
              path: ['charts', ci, 'data', 'series', si],
              message: `series "${s.name}" has ${s.values.length} values but ${n} categories`,
            });
          }
        });
      }
      if (c.type === 'cohort-heatmap') {
        const cols = c.data.periods.length;
        c.data.values.forEach((row, ri) => {
          if (row.length !== cols) {
            ctx.addIssue({
              code: 'custom',
              path: ['charts', ci, 'data', 'values', ri],
              message: `row ${ri} has ${row.length} values but ${cols} periods`,
            });
          }
        });
      }
    });
    const ids = file.charts.map((c) => c.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', path: ['charts'], message: 'chart ids must be unique' });
    }
  });
export type ChartPayload = z.infer<typeof chartFileSchema>;

const CHARTS_DIR = path.join(process.cwd(), 'src', 'data', 'charts');

export function loadChartFile(slug: string): ChartPayload | null {
  const file = path.join(CHARTS_DIR, `${slug}.json`);
  if (!existsSync(file)) return null;
  const parsed = JSON.parse(readFileSync(file, 'utf-8'));
  const result = chartFileSchema.safeParse(parsed);
  if (!result.success) {
    const details = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`charts/${slug}.json failed validation:\n${details}`);
  }
  return result.data;
}

export function loadAllChartFiles(): ChartPayload[] {
  return readdirSync(CHARTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => loadChartFile(f.replace(/\.json$/, '')))
    .filter((p): p is ChartPayload => p !== null);
}

// Series palette — dataviz teal first (the site's dedicated chart accent), then
// the coral action accent and neutrals. CSS variables resolve per theme.
export const CHART_PALETTE = [
  'var(--text-accent-dataviz)',
  'var(--text-accent)',
  'var(--text-muted)',
  'var(--text-normal)',
];