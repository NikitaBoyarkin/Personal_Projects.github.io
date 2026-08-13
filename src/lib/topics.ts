// Single source of truth for the skill taxonomy. Shared by TopicMap.astro and
// topics/index.astro so the two no longer keep their own copies in sync.
import { withBase } from "./path";

export type TopicLevel = "junior" | "middle" | "senior" | "meta";

export interface Topic {
  key: string;
  label: string;
  level: TopicLevel;
  blurb: string;
  match: (tag: string) => boolean;
}

export const TOPICS: Topic[] = [
  {
    key: "sql",
    label: "SQL",
    level: "junior",
    blurb: "Запросы, оконные функции, агрегации — фундамент аналитика.",
    match: (t) => t === "sql",
  },
  {
    key: "python",
    label: "Python",
    level: "junior",
    blurb: "pandas, NumPy, воспроизводимые пайплайны данных.",
    match: (t) => t === "python" || t === "pandas",
  },
  {
    key: "ab-testing",
    label: "A/B-тестирование",
    level: "middle",
    blurb: "Методология экспериментов: CUPED, AA-тесты, байесовский вывод.",
    match: (t) => t === "ab-testing" || t === "bayesian" || t === "statistics",
  },
  {
    key: "retention",
    label: "Retention / когорты",
    level: "middle",
    blurb: "Когортный анализ, кривые retention, отток.",
    match: (t) => t === "retention" || t === "cohort-analysis",
  },
  {
    key: "segmentation",
    label: "Сегментация",
    level: "middle",
    blurb: "RFM, поведенческие и денежные сегменты клиентов.",
    match: (t) => t === "rfm" || t === "segmentation" || t === "customer-analytics",
  },
  {
    key: "automation",
    label: "Автоматизация",
    level: "middle",
    blurb: "Telegram-боты, отчётность, оркестрация пайплайнов.",
    match: (t) => t === "automation" || t === "telegram" || t === "reporting",
  },
  {
    key: "career",
    label: "Карьера",
    level: "meta",
    blurb: "Портфолио, интервью, развитие data-аналитика.",
    match: (t) => t === "career" || t === "portfolio" || t === "data-analyst",
  },
];

export interface TopicRow {
  key: string;
  label: string;
  level: TopicLevel;
  blurb: string;
  href: string;
  count: number;
}

// Minimal shape of a collection entry we depend on — decouples from astro:content
// types so this module stays portable and testable.
interface Countable {
  id: string;
  data: { tags?: string[]; tools?: string[]; title: string; description?: string };
}

/**
 * Compute one row per topic with the number of posts (via tag matching) plus
 * projects (via slug/title/tools/description signal matching). Topics with a
 * zero count are dropped; the rest are sorted by count desc.
 *
 * Ported verbatim from the duplicated logic that lived in TopicMap.astro and
 * topics/index.astro so behaviour is unchanged.
 */
export function computeTopicRows(posts: Countable[], projects: Countable[]): TopicRow[] {
  const postCounts = new Map<string, number>(TOPICS.map((t) => [t.key, 0]));
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      for (const topic of TOPICS) {
        if (topic.match(tag)) postCounts.set(topic.key, (postCounts.get(topic.key) ?? 0) + 1);
      }
    }
  }

  const projectCounts = new Map<string, number>(TOPICS.map((t) => [t.key, 0]));
  const projectSignals = projects.map((p) => ({
    slug: p.id.replace(/\.md$/, ""),
    title: p.data.title.toLowerCase(),
    tools: (p.data.tools ?? []).join(" ").toLowerCase(),
    desc: (p.data.description ?? "").toLowerCase(),
  }));
  for (const topic of TOPICS) {
    const needle = topic.key.replace("-", " ");
    const hits = projectSignals.filter(
      (p) =>
        p.slug.includes(needle) ||
        p.title.includes(needle) ||
        p.tools.includes(needle) ||
        p.desc.includes(needle),
    );
    projectCounts.set(topic.key, hits.length);
  }

  return TOPICS.map((t) => ({
    key: t.key,
    label: t.label,
    level: t.level,
    blurb: t.blurb,
    href: withBase(`topics/${t.key}/`),
    count: (postCounts.get(t.key) ?? 0) + (projectCounts.get(t.key) ?? 0),
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Group rows by level, preserving the count-desc order within each group. */
export function groupRowsByLevel(rows: TopicRow[]): { level: TopicLevel; rows: TopicRow[] }[] {
  const order: TopicLevel[] = ["junior", "middle", "senior", "meta"];
  return order
    .map((level) => ({ level, rows: rows.filter((r) => r.level === level) }))
    .filter((g) => g.rows.length > 0);
}

export const LEVEL_LABELS: Record<TopicLevel, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  meta: "Развитие",
};