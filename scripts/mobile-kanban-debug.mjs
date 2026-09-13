import { chromium, devices } from 'playwright';

const baseUrl = 'http://localhost:4321/Personal_Projects.github.io/projects/';

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
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    const info = await page.evaluate(() => {
      const board = document.querySelector('#project-list.kanban-board');
      const pageBoard = document.querySelector('#page-board');
      const columns = document.querySelectorAll('#project-list.kanban-board .kanban-column, #page-board .kanban-column');
      const firstColumn = columns[0];

      function rect(el) {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          rect: { width: r.width, height: r.height, top: r.top, left: r.left, bottom: r.bottom, right: r.right },
          style: {
            display: cs.display,
            visibility: cs.visibility,
            position: cs.position,
            flex: cs.flex,
            minWidth: cs.minWidth,
            maxWidth: cs.maxWidth,
            minHeight: cs.minHeight,
            maxHeight: cs.maxHeight,
            overflow: cs.overflow,
            overflowX: cs.overflowX,
            overflowY: cs.overflowY,
          },
        };
      }

      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        body: { scrollHeight: document.body.scrollHeight, scrollWidth: document.body.scrollWidth },
        boardSelector: '#project-list.kanban-board',
        boardFound: !!board,
        boardRect: rect(board),
        pageBoardFound: !!pageBoard,
        pageBoardRect: rect(pageBoard),
        columnCount: columns.length,
        firstColumnRect: rect(firstColumn),
        firstColumnHTML: firstColumn ? firstColumn.outerHTML.slice(0, 500) : null,
      };
    });

    console.log(`\n=== ${vp.name} (${vp.width}x${vp.height}) ===`);
    console.log(JSON.stringify(info, null, 2));

    await page.close();
    await context.close();
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
