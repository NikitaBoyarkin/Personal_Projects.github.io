#!/usr/bin/env bun
// GitHub ↔ portfolio metadata sync.
//
// Reads the `github:` URL from every project file (RU + EN), queries the GitHub
// API for live metadata, and reports drift between the repo state and the
// frontmatter. In `--apply` mode it writes the authoritative fields back:
//   - `private: true|false`  (repo visibility)
//   - `updated: YYYY-MM-DD`  (last push date; the `date` field is the authored
//                             publication date and is intentionally untouched)
//
// Usage:
//   bun run sync:gh                  # check (default) — exit 1 on hard drift
//   bun run sync:gh --apply          # write private/updated into frontmatter
//   bun run sync:gh --apply --dry-run  # show what would change, write nothing
//   bun run sync:gh --candidates     # list account repos not yet in the portfolio
//
// Auth: GITHUB_TOKEN / GH_TOKEN env is used when present (higher rate limit).
// Unauthenticated works for public repos (60 req/hr — enough for 16 projects).

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const COLLECTIONS = ['src/content/projects', 'src/content/projects-en'];
const OWNER = 'NikitaBoyarkin';
const API = 'https://api.github.com';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

const args = process.argv.slice(2);
const mode = args.includes('--apply') ? 'apply' : 'check';
const dryRun = args.includes('--dry-run');
const showCandidates = args.includes('--candidates');

let hardDrift = false; // becomes true → exit code 1
const report = [];

async function gh(pathname) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-sync' };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(`${API}${pathname}`, { headers });
  if (res.status === 404) return null;
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    throw new Error('GitHub API rate limit exceeded — set GITHUB_TOKEN or wait an hour');
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${pathname}`);
  return res.json();
}

function extractRepo(githubUrl) {
  try {
    const u = new URL(githubUrl);
    if (u.hostname !== 'github.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    return parts.length >= 2 ? { owner: parts[0], repo: parts[1] } : null;
  } catch {
    return null;
  }
}

// --- collect all project files with a github URL ----------------------------
async function collectProjects() {
  const files = [];
  for (const dir of COLLECTIONS) {
    const abs = path.join(ROOT, dir);
    const names = await readdir(abs);
    for (const name of names) {
      if (!name.endsWith('.md')) continue;
      const p = path.join(abs, name);
      const text = await readFile(p, 'utf8');
      const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      if (!m) continue;
      const fm = parseFrontmatter(m[1]);
      if (!fm.github) continue;
      files.push({ file: p, slug: name.replace(/\.md$/, ''), text, fm, fmBlock: m[1] });
    }
  }
  return files;
}

function parseFrontmatter(block) {
  const out = {};
  for (const raw of block.split('\n')) {
    const line = raw.trim();
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (val === '') continue;
    if (val === 'true' || val === 'false') out[key] = val === 'true';
    else if (!Number.isNaN(Number(val))) out[key] = Number(val);
    else out[key] = val;
  }
  return out;
}

// Surgical frontmatter edit: replace or insert scalar lines, preserving the
// rest of the block byte-for-byte (no reformat of untouched lines).
// A null value removes the line if present (lets the schema default apply).
function editFrontmatter(text, updates) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return text;
  const lines = m[1].split('\n');
  let changed = false;
  for (const [key, value] of Object.entries(updates)) {
    const re = new RegExp(`^\\s*${key}:\\s*.*$`);
    const idx = lines.findIndex((l) => re.test(l));
    if (value === null || value === undefined) {
      if (idx >= 0) {
        lines.splice(idx, 1);
        changed = true;
      }
      continue;
    }
    const newLine = `${key}: ${value}`;
    if (idx >= 0) {
      if (lines[idx].trim() !== newLine) {
        lines[idx] = newLine;
        changed = true;
      }
    } else {
      const anchor = lines.findIndex((l) => /^github:/.test(l.trim()));
      const insertAt = anchor >= 0 ? anchor + 1 : lines.length;
      lines.splice(insertAt, 0, newLine);
      changed = true;
    }
  }
  if (!changed) return text;
  const newBlock = lines.join('\n');
  return text.replace(m[1], newBlock);
}

// --- check / apply per repo (updates RU + EN twin files together) -----------
async function processRepo(repoKey, group, dry) {
  const { owner, repo } = extractRepo(group[0].fm.github) ?? {};
  if (!owner || !repo) {
    report.push(`  [skip] ${repoKey}: не могу разобрать github-URL (${group[0].fm.github})`);
    return;
  }
  const meta = await gh(`/repos/${owner}/${repo}`);
  const isPrivate = group[0].fm.private === true;
  const updated = group[0].fm.updated ? String(group[0].fm.updated).slice(0, 10) : null;

  if (meta === null) {
    // 404: deleted / renamed, or private and unauthenticated.
    if (!TOKEN && isPrivate) {
      report.push(`  [ok]  ${repoKey}: репо приватное (${repo}), токена нет — пропускаю`);
      return;
    }
    report.push(`  [ERR] ${repoKey}: репо не найдено (${repo}) — удалено/переименовано${isPrivate ? '' : ' или стало приватным'}`);
    hardDrift = true;
    return;
  }

  if (meta.archived) {
    report.push(`  [warn] ${repoKey}: репо ${repo} архивировано`);
  }
  if (meta.fork) {
    report.push(`  [warn] ${repoKey}: ${repo} — форк`);
  }

  // hard drift: repo private but frontmatter doesn't say so
  if (meta.private && !isPrivate) {
    report.push(`  [ERR] ${repoKey}: репо ${repo} стало приватным, в frontmatter нет private: true`);
    hardDrift = true;
  } else if (!meta.private && isPrivate) {
    report.push(`  [info] ${repoKey}: репо ${repo} теперь публичное — можно убрать private: true`);
  }

  const pushed = (meta.pushed_at || '').slice(0, 10);
  if (pushed && updated !== pushed) {
    if (mode === 'apply') {
      report.push(`  [sync] ${repoKey}: updated ${updated ?? '—'} → ${pushed}`);
      if (!dry) for (const p of group) await writeProject(p, { private: meta.private, updated: pushed });
    } else {
      report.push(`  [info] ${repoKey}: updated ${updated ?? '—'} ≠ ${pushed} (запусти sync:gh --apply)`);
    }
  }
}

async function writeProject(project, updates) {
  const newText = editFrontmatter(project.text, {
    private: updates.private ? 'true' : null, // omit when public (schema default)
    updated: updates.updated,
  });
  if (newText !== project.text) await writeFile(project.file, newText, 'utf8');
}

// --- candidates: account repos not referenced in the portfolio --------------
async function listCandidates(projects) {
  const referenced = new Set(
    projects
      .map((p) => extractRepo(p.fm.github))
      .filter(Boolean)
      .map(({ repo }) => repo.toLowerCase()),
  );
  const repos = await gh(`/users/${OWNER}/repos?per_page=100&sort=updated`);
  if (!repos) return;
  const candidates = repos
    .filter((r) => !r.fork && !r.archived && !r.private)
    .filter((r) => r.name.toLowerCase() !== OWNER.toLowerCase()) // profile README repo is not a project
    .filter((r) => !referenced.has(r.name.toLowerCase()))
    .sort((a, b) => (b.pushed_at || '').localeCompare(a.pushed_at || ''));
  if (candidates.length === 0) {
    report.push('\n  Кандидатов на добавление нет — все публичные репо уже в портфолио.');
    return;
  }
  report.push('\n  Кандидаты на добавление (публичные, не-форки, не в портфолио):');
  for (const r of candidates.slice(0, 10)) {
    const desc = (r.description || '').slice(0, 70);
    report.push(`  • ${r.name} (${r.language ?? '—'}, ★${r.stargazers_count}) ${r.pushed_at?.slice(0, 10)} — ${desc}`);
  }
  report.push(`  ... всего ${candidates.length}`);
}

// --- main --------------------------------------------------------------------
const projects = await collectProjects();
const byRepo = new Map();
for (const p of projects) {
  const key = extractRepo(p.fm.github)?.repo?.toLowerCase();
  if (!key) continue;
  if (!byRepo.has(key)) byRepo.set(key, []);
  byRepo.get(key).push(p);
}

report.push(`GitHub ↔ портфолио (${mode}${dryRun ? ' · dry-run' : ''}):`);
for (const [repo, group] of byRepo) {
  await processRepo(repo, group, dryRun);
}

if (showCandidates || mode === 'check') {
  await listCandidates(projects);
}

console.log(report.join('\n'));

process.exit(hardDrift ? 1 : 0);