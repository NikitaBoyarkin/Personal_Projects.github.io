#!/usr/bin/env node
/**
 * portfolio-category-guard.js — PostToolUse guard for portfolio post frontmatter.
 *
 * Validates that `category:` in src/content/posts/*.md frontmatter matches the
 * BlogFilter.astro taxonomy. Prevents the article/doka vs decision-log/framework/
 * guide/note mismatch that silently broke the writing-page filter (clicking a tag
 * hid all cards because data-category didn't match).
 *
 * Fires on Write|Edit to post markdown files. Exits 2 (feedback to Claude) on
 * invalid category so the agent can correct it.
 */

import { readFileSync } from 'fs';

const ALLOWED = ['decision-log', 'framework', 'guide', 'note'];

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const fp = data.tool_input?.file_path || '';
  // Only portfolio posts: .../src/content/posts/<slug>.md
  if (!/src\/content\/posts\/[^/]+\.md$/.test(fp)) process.exit(0);

  let content;
  try {
    content = readFileSync(fp, 'utf8');
  } catch {
    process.exit(0);
  }

  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) process.exit(0); // no frontmatter — not our concern

  const catMatch = fm[1].match(/^category:\s*(.+?)\s*$/m);
  if (!catMatch) process.exit(0); // schema validation handles missing field

  const cat = catMatch[1].replace(/^["']|["']$/g, '').trim();
  if (!ALLOWED.includes(cat)) {
    console.error(
      `[portfolio-category-guard] Invalid category "${cat}" in ${fp}.`
    );
    console.error(
      `[portfolio-category-guard] Allowed: ${ALLOWED.join(', ')} (must match BlogFilter.astro keys).`
    );
    console.error(
      `[portfolio-category-guard] If you added a new tag, update src/components/BlogFilter.astro categories[] first.`
    );
    process.exit(2);
  }
  process.exit(0);
});