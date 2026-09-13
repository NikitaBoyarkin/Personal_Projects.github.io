import { chromium, devices } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://localhost:4321/Personal_Projects.github.io/';

const viewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'pixel-7', width: 412, height: 915 },
];

const pages = [
  { path: '', name: 'home' },
  { path: 'projects/', name: 'projects' },
  { path: 'about/', name: 'about' },
  { path: 'writing/', name: 'writing' },
  { path: 'contact/', name: 'contact' },
];

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: devices['iPhone 14']?.userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    });

    for (const pageInfo of pages) {
      const page = await context.newPage();
      const url = `${baseUrl}${pageInfo.path}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);

        // Measure horizontal overflow
        const overflow = await page.evaluate(() => {
          return {
            bodyScrollWidth: document.body.scrollWidth,
            viewportWidth: window.innerWidth,
            overflowX: document.body.scrollWidth > window.innerWidth,
          };
        });

        // Count key elements
        const counts = await page.evaluate(() => {
          return {
            navLinks: document.querySelectorAll('nav ul.links a').length,
            hamburgerVisible: !!document.querySelector('.nav-toggle') && getComputedStyle(document.querySelector('.nav-toggle')).display !== 'none',
            projects: document.querySelectorAll('#project-list .project, #project-list .kanban-column').length,
            kanbanColumns: document.querySelectorAll('#project-list.kanban-board .kanban-column, #page-board .kanban-column').length,
            bentoCells: document.querySelectorAll('.bento-cell').length,
            projectCards: document.querySelectorAll('.project').length,
          };
        });

        // Test hamburger menu
        let menuResult = 'no-hamburger';
        if (counts.hamburgerVisible) {
          const toggle = await page.$('.nav-toggle');
          if (toggle) {
            await toggle.click();
            await page.waitForTimeout(300);
            const linksOpen = await page.evaluate(() => {
              const ul = document.querySelector('nav ul.links');
              return ul ? getComputedStyle(ul).display !== 'none' : false;
            });
            menuResult = linksOpen ? 'opens' : 'fails-to-open';
          }
        }

        results.push({
          page: pageInfo.name,
          viewport: vp.name,
          width: vp.width,
          overflow,
          counts,
          menuResult,
        });
      } catch (err) {
        results.push({ page: pageInfo.name, viewport: vp.name, error: err.message });
      } finally {
        await page.close();
      }
    }
    await context.close();
  }

  await browser.close();

  // Print as markdown table
  console.log('| Page | Viewport | Overflow | Projects/Kanban | Hamburger |');
  console.log('|------|----------|----------|-----------------|-----------|');
  for (const r of results) {
    if (r.error) {
      console.log(`| ${r.page} | ${r.viewport} | ERROR: ${r.error} | - | - |`);
      continue;
    }
    const ov = r.overflow.overflowX ? `YES (${r.overflow.bodyScrollWidth}px)` : 'no';
    const proj = `cards=${r.counts.projectCards}, kanbanCols=${r.counts.kanbanColumns}`;
    console.log(`| ${r.page} | ${r.viewport} (${r.width}px) | ${ov} | ${proj} | ${r.menuResult} |`);
  }

  // Detailed JSON
  console.log('\n<!-- JSON_RESULTS -->');
  console.log(JSON.stringify(results, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
