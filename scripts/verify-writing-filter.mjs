// Regression check for the writing ("Статьи") filter.
//
// Guards the CSS-cascade bug fixed in `src/styles/blog.css`: `.blog-list` and
// `.pagination` set an author `display`, which beats the UA `[hidden] {
// display: none }` rule. Without the explicit `[hidden]` guard the static list
// stayed visible after a filter click and the filtered results were appended
// below the fold — so the click looked like it did nothing.
//
// Run against a served build (dist), e.g.:
//   bun run serve-dist &            # http://localhost:4321
//   bun run scripts/verify-writing-filter.mjs
// Or point BASE_URL anywhere:
//   BASE_URL=http://localhost:4330/ bun run scripts/verify-writing-filter.mjs
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://localhost:4321/';
const path = process.env.WRITING_PATH || 'writing/';
const tag = process.env.WRITING_TAG || 'python';

const failures = [];
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(name);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

try {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 30000 });

  const chip = page.locator(`.filter-tag[data-tag="${tag}"]`).first();
  check(`tag chip "${tag}" present`, (await chip.count()) > 0);
  await chip.click();
  await page.waitForTimeout(300);

  const staticList = page.locator('#blog-list');
  const staticHidden =
    (await staticList.getAttribute('hidden')) !== null &&
    (await staticList.evaluate((el) => getComputedStyle(el).display)) === 'none';
  check('static #blog-list is hidden after filtering', staticHidden);

  const pagination = await page.locator('.pagination').count();
  if (pagination > 0) {
    const pagHidden =
      (await page.locator('.pagination').getAttribute('hidden')) !== null &&
      (await page.locator('.pagination').evaluate((el) => getComputedStyle(el).display)) === 'none';
    check('pagination is hidden after filtering', pagHidden);
  }

  const results = page.locator('#blog-filter-results');
  check('filtered results container exists', (await results.count()) === 1);
  const cards = await page.locator('#blog-filter-results .blog-card').count();
  check('filtered results are non-empty', cards > 0, `${cards} cards`);

  const status = (await page.locator('#blog-filter-status').textContent())?.trim() ?? '';
  check('status announces the filter', status.includes(tag), JSON.stringify(status));

  // The whole point: results must be visible in place, not pushed far below the
  // (previously still-visible) static list.
  const firstTop = await page
    .locator('#blog-filter-results .blog-card')
    .first()
    .evaluate((el) => Math.round(el.getBoundingClientRect().top));
  check('first result sits at the top of the list, not below the fold', firstTop < 1500, `top=${firstTop}px`);

  // Category badge on a card: must filter, not navigate.
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
  const badge = page.locator('.blog-card [data-card-category]').first();
  check('card category badge is a filter control', (await badge.count()) > 0);
  const category = await badge.getAttribute('data-card-category');
  const pathBefore = new URL(page.url()).pathname;
  await badge.click();
  await page.waitForTimeout(300);
  check('badge click does not navigate', new URL(page.url()).pathname === pathBefore, page.url());
  check('badge click filters the list', (await page.locator('#blog-filter-results .blog-card').count()) > 0);
  const badgeStatus = (await page.locator('#blog-filter-status').textContent())?.trim() ?? '';
  check('badge status reflects the category', category ? badgeStatus.includes(category) : true, JSON.stringify(badgeStatus));

  check('no page errors', errors.length === 0, errors.join(' | '));
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\nAll writing-filter checks passed.');
