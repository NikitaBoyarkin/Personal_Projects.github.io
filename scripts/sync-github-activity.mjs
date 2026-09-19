#!/usr/bin/env bun
// GitHub activity → site chart payload.
//
// Fetches the profile owner's public GitHub data in one GraphQL call and writes
// `src/data/github-activity.json` — a stats block plus chart cards that validate
// against `src/lib/charts.ts` (chartFileSchema). Rendered on /about by
// `src/components/GithubActivity.astro` through the site's native ChartCard
// components, so the charts inherit theme, i18n and accessibility.
//
// The payload is a build-time snapshot, regenerated daily by
// `.github/workflows/github-activity.yml`. Numbers are real (public GitHub
// data); nothing is synthesized.
//
// Usage:
//   bun run sync:activity            # fetch and write the payload
//   bun run sync:activity --dry-run  # fetch, print a summary, write nothing
//
// Auth: GITHUB_TOKEN / GH_TOKEN / STREAK_PAT. Public data works with the default
// Actions token; a PAT (STREAK_PAT) gives a more complete contribution calendar.
// Reproduce like the profile repo (NikitaBoyarkin/scripts/build_profile.py).

import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'src', 'data', 'github-activity.json');
const LOGIN = process.env.GH_USER || 'NikitaBoyarkin';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.STREAK_PAT || '';
const API = 'https://api.github.com/graphql';
const DRY_RUN = process.argv.includes('--dry-run');

// Localized text helper — every chart field is bilingual {ru, en}.
const L = (ru, en) => ({ ru, en });

if (!TOKEN) {
  console.error('No GitHub token found. Set GITHUB_TOKEN, GH_TOKEN or STREAK_PAT.');
  process.exit(1);
}

// --- GitHub GraphQL with bounded retries ------------------------------------

async function graphql(query, variables, retries = 3) {
  const payload = JSON.stringify({ query, variables });
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: {
          Authorization: `bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'portfolio-activity-sync',
        },
        body: payload,
      });
      if (res.status === 401) throw new Error('GitHub token rejected (401)');
      if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
      const data = await res.json();
      if (data.errors) throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      return data.data;
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      const wait = 2 ** (attempt - 1);
      console.warn(`GraphQL attempt ${attempt}/${retries} failed: ${error.message}; retrying in ${wait}s`);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    }
  }
  throw new Error(`GitHub GraphQL exhausted retries: ${lastError?.message ?? 'unknown'}`);
}

const QUERY = `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      createdAt
      followers { totalCount }
      repositories(isFork: false, privacy: PUBLIC, first: 100, ownerAffiliations: OWNER,
                   orderBy: { field: UPDATED_AT, direction: DESC }) {
        totalCount
        nodes {
          languages(first: 50, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
      }
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

// --- date helpers -----------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function round1(value) {
  return Math.round(value * 10) / 10;
}

function ddmm(iso) {
  const [, m, d] = iso.split('-');
  return `${d}.${m}`;
}

function mondayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dow = (date.getUTCDay() + 6) % 7; // Monday = 0
  date.setUTCDate(date.getUTCDate() - dow);
  return date.toISOString().slice(0, 10);
}

function monthShort(ym) {
  const [, m] = ym.split('-').map(Number);
  return MONTHS[m - 1];
}

function truncate(text, limit) {
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

// --- aggregation ------------------------------------------------------------

function computeStreaks(days) {
  let current = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].contributionCount > 0) current += 1;
    else break;
  }
  let longest = 0;
  let running = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }
  return { current, longest };
}

function groupMonthly(days) {
  const totals = new Map();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    totals.set(key, (totals.get(key) ?? 0) + day.contributionCount);
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);
}

function groupWeekly(days) {
  const totals = new Map();
  for (const day of days) {
    const key = mondayOf(day.date);
    totals.set(key, (totals.get(key) ?? 0) + day.contributionCount);
  }
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function aggregateLanguages(repos) {
  const agg = new Map();
  for (const repo of repos) {
    for (const edge of repo?.languages?.edges ?? []) {
      const name = edge.node.name;
      agg.set(name, (agg.get(name) ?? 0) + edge.size);
    }
  }
  return [...agg.entries()].sort((a, b) => b[1] - a[1]);
}

// --- chart builders ---------------------------------------------------------

function buildCharts(user) {
  const collection = user.contributionsCollection;
  const allDays = collection.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
  const todayIso = new Date().toISOString().slice(0, 10);
  const days = allDays.filter((day) => day.date <= todayIso);
  const charts = [];

  // 1) Last 30 days — line.
  const tail = days.slice(-30);
  const tailValues = tail.map((day) => day.contributionCount);
  const sum30 = tailValues.reduce((a, b) => a + b, 0);
  const avg30 = round1(sum30 / (tail.length || 1));
  const peak = tail.reduce((best, day) => (day.contributionCount > best.contributionCount ? day : best), tail[0] ?? { contributionCount: 0, date: todayIso });
  charts.push({
    id: 'activity-30d',
    type: 'line',
    title: L('Активность за 30 дней', 'Activity over the last 30 days'),
    description: L(
      'Вклады по дням за последние 30 дней — коммиты, pull requests, issues и ревью в публичных репозиториях.',
      'Daily contributions over the last 30 days — commits, pull requests, issues and reviews in public repositories.',
    ),
    xLabel: L('День (ДД.ММ)', 'Day (DD.MM)'),
    yLabel: L('Вклады за день', 'Contributions per day'),
    data: {
      categories: tail.map((day) => ddmm(day.date)),
      series: [{ name: 'Contributions', values: tailValues }],
    },
    labelEvery: 5,
    conclusions: [
      L(
        `За последние 30 дней — ${sum30} вкладов, в среднем ${avg30} в день.`,
        `Over the last 30 days: ${sum30} contributions, averaging ${avg30} per day.`,
      ),
      L(
        `Пик активности — ${peak.contributionCount} вкладов за один день.`,
        `Peak activity: ${peak.contributionCount} contributions in a single day.`,
      ),
    ],
  });

  // 2) Monthly — bar.
  const monthly = groupMonthly(days);
  const monthlyValues = monthly.map(([, value]) => value);
  const monthlySum = monthlyValues.reduce((a, b) => a + b, 0);
  const bestMonth = monthly.reduce((best, entry) => (entry[1] > best[1] ? entry : best), monthly[0] ?? ['', 0]);
  const bestMonthPct = round1((bestMonth[1] / (monthlySum || 1)) * 100);
  charts.push({
    id: 'monthly-contributions',
    type: 'bar',
    title: L('Контрибуции по месяцам', 'Contributions by month'),
    description: L(
      'Сумма вкладов по календарным месяцам за последние 12 месяцев.',
      'Total contributions per calendar month over the last 12 months.',
    ),
    xLabel: L('Месяц', 'Month'),
    yLabel: L('Вклады', 'Contributions'),
    data: {
      categories: monthly.map(([key]) => monthShort(key)),
      series: [{ name: 'Contributions', values: monthlyValues }],
    },
    conclusions: [
      L(
        `За 12 месяцев — ${monthlySum} вкладов.`,
        `Over 12 months: ${monthlySum} contributions.`,
      ),
      L(
        `Сильнейший месяц — ${monthShort(bestMonth[0])} с ${bestMonth[1]} вкладами (${bestMonthPct}% годового объёма).`,
        `The strongest month is ${monthShort(bestMonth[0])} with ${bestMonth[1]} contributions (${bestMonthPct}% of the annual total).`,
      ),
    ],
  });

  // 3) Weekly — line (a 53x7 heatmap is unreadable in the site's chart grid).
  const weekly = groupWeekly(days);
  const weeklyValues = weekly.map(([, value]) => value);
  const busiest = weekly.reduce((best, entry) => (entry[1] > best[1] ? entry : best), weekly[0] ?? ['', 0]);
  const activeWeeks = weeklyValues.filter((value) => value > 0).length;
  const weeklyAvg = round1(weeklyValues.reduce((a, b) => a + b, 0) / (weekly.length || 1));
  charts.push({
    id: 'weekly-contributions',
    type: 'line',
    title: L('Контрибуции по неделям за год', 'Contributions by week over the year'),
    description: L(
      'Сумма вкладов по неделям (неделя начинается с понедельника) за последние 12 месяцев.',
      'Total contributions per week (weeks start on Monday) over the last 12 months.',
    ),
    xLabel: L('Неделя (ДД.ММ)', 'Week (DD.MM)'),
    yLabel: L('Вклады за неделю', 'Contributions per week'),
    data: {
      categories: weekly.map(([key]) => ddmm(key)),
      series: [{ name: 'Contributions', values: weeklyValues }],
    },
    labelEvery: 6,
    conclusions: [
      L(
        `Активных недель — ${activeWeeks} из ${weekly.length}, в среднем ${weeklyAvg} вкладов в неделю.`,
        `Active weeks: ${activeWeeks} of ${weekly.length}, averaging ${weeklyAvg} contributions per week.`,
      ),
      L(
        `Самая продуктивная неделя — ${busiest[1]} вкладов.`,
        `The most productive week: ${busiest[1]} contributions.`,
      ),
    ],
  });

  // 4) Contribution types — bar.
  const types = [
    ['Commits', collection.totalCommitContributions],
    ['Pull Requests', collection.totalPullRequestContributions],
    ['Issues', collection.totalIssueContributions],
    ['Code Reviews', collection.totalPullRequestReviewContributions],
  ];
  const typesSum = types.reduce((acc, [, value]) => acc + value, 0);
  const [topType, topTypeValue] = types.reduce((best, entry) => (entry[1] > best[1] ? entry : best), types[0]);
  const topTypePct = round1((topTypeValue / (typesSum || 1)) * 100);
  charts.push({
    id: 'contribution-types',
    type: 'bar',
    title: L('Типы вкладов', 'Contribution types'),
    description: L(
      'Как годовые вклады делятся по типам: коммиты, pull requests, issues и ревью кода.',
      'How the year\u2019s contributions break down by type: commits, pull requests, issues and code reviews.',
    ),
    xLabel: L('Тип', 'Type'),
    yLabel: L('Вклады', 'Contributions'),
    data: {
      categories: types.map(([label]) => label),
      series: [{ name: 'Contributions', values: types.map(([, value]) => value) }],
    },
    conclusions: [
      L(
        `Всего ${typesSum} вкладов за год.`,
        `${typesSum} contributions in total over the year.`,
      ),
      L(
        `Основной тип — ${topType} (${topTypeValue}, ${topTypePct}% вкладов).`,
        `The dominant type is ${topType} (${topTypeValue}, ${topTypePct}% of contributions).`,
      ),
    ],
  });

  // 5) Top languages — bar (percent share).
  const languages = aggregateLanguages(user.repositories.nodes ?? []);
  const langTotal = languages.reduce((acc, [, size]) => acc + size, 0) || 1;
  const top = languages.slice(0, 8).map(([name, size]) => [name, round1((size / langTotal) * 100)]);
  if (languages.length > 8) {
    const otherPct = round1((languages.slice(8).reduce((acc, [, size]) => acc + size, 0) / langTotal) * 100);
    top.push(['Other', otherPct]);
  }
  const topLang = languages[0] ?? ['—', 0];
  const topLangPct = round1((topLang[1] / langTotal) * 100);
  charts.push({
    id: 'top-languages',
    type: 'bar',
    title: L('Топ языков', 'Top languages'),
    description: L(
      'Доля языков по байтам кода в публичных нефоркнутых репозиториях. Языки за пределами топ-8 сгруппированы в Other.',
      'Language share by code bytes across public non-fork repositories. Languages beyond the top 8 are grouped into Other.',
    ),
    xLabel: L('Язык', 'Language'),
    yLabel: L('Доля, %', 'Share, %'),
    data: {
      categories: top.map(([name]) => truncate(name, 9)),
      series: [{ name: '%', values: top.map(([, pct]) => pct) }],
    },
    conclusions: [
      L(
        `Основной язык — ${topLang[0]} с долей ${topLangPct}% от ${langTotal} байт кода.`,
        `The primary language is ${topLang[0]} at ${topLangPct}% of ${langTotal} bytes of code.`,
      ),
      L(
        `Всего в профиле ${languages.length} языков, из них ${top.length} показаны на графике.`,
        `The profile uses ${languages.length} languages in total; ${top.length} are shown in the chart.`,
      ),
    ],
  });

  return { days, charts };
}

// --- main -------------------------------------------------------------------

async function main() {
  const today = new Date();
  const endIso = today.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - 364 * 86_400_000);
  const startDow = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - startDow);

  console.log(`Fetching GitHub data for ${LOGIN} (${start.toISOString().slice(0, 10)} → ${endIso})...`);
  const data = await graphql(QUERY, {
    login: LOGIN,
    from: `${start.toISOString().slice(0, 10)}T00:00:00Z`,
    to: `${endIso}T23:59:59Z`,
  });

  const user = data.user;
  if (!user) throw new Error(`GitHub user ${LOGIN} not found`);

  const { days, charts } = buildCharts(user);
  const streaks = computeStreaks(days);

  const payload = {
    slug: 'github',
    source: `GitHub API · updated ${new Date().toISOString().slice(0, 10)}`,
    updatedAt: new Date().toISOString(),
    stats: {
      contributions: user.contributionsCollection.contributionCalendar.totalContributions,
      publicRepos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      activeSince: Number(user.createdAt.slice(0, 4)),
    },
    charts,
  };

  if (DRY_RUN) {
    console.log('[dry-run] would write src/data/github-activity.json');
    console.log(`  stats: ${JSON.stringify(payload.stats)}`);
    for (const chart of charts) console.log(`  chart: ${chart.id} (${chart.type})`);
    return;
  }

  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote src/data/github-activity.json: ${charts.length} charts, ${payload.stats.contributions} contributions`);
}

await main();
