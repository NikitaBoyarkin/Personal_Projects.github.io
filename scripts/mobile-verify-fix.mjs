import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'reports', 'mobile-screenshots');
mkdirSync(outDir, { recursive: true });
const baseUrl = process.env.BASE_URL || 'http://localhost:4322/Personal_Projects.github.io/';

const viewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
];

async function run() {
  const browser = await chromium.launch();

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: devices['iPhone 14']?.userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}projects/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    const metrics = await page.evaluate(() => {
      const board = document.querySelector('#project-list.kanban-board');
      const firstCol = document.querySelector('#project-list.kanban-board .kanban-column');
      const h2 = document.querySelector('#projects h2');
      const rect = (el) => el ? el.getBoundingClientRect() : null;
      return {
        viewportHeight: window.innerHeight,
        boardTop: rect(board)?.top ?? null,
        firstColumnTop: rect(firstCol)?.top ?? null,
        firstColumnHeight: rect(firstCol)?.height ?? null,
        h2Top: rect(h2)?.top ?? null,
        h2Bottom: rect(h2)?.bottom ?? null,
      };
    });

    console.log(`\n=== ${vp.name} ===`);
    console.log(JSON.stringify(metrics, null, 2));
    console.log(`Board visible above fold: ${metrics.boardTop !== null && metrics.boardTop < metrics.viewportHeight}`);

    await page.screenshot({
      path: join(outDir, `projects-${vp.name}-after-fix-viewport.png`),
      fullPage: false,
    });

    await page.close();
    await context.close();
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
