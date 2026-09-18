import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'reports', 'mobile-screenshots');
mkdirSync(outDir, { recursive: true });
const baseUrl = 'http://localhost:4321/projects/';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: devices['iPhone 14']?.userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);

  // Scroll down in steps and capture
  for (let i = 0; i <= 3; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 300);
    await page.waitForTimeout(600);
    const visibleCount = await page.evaluate(() => document.querySelectorAll('.reveal.visible').length);
    console.log(`scroll ${i * 300}px: ${visibleCount} visible cards`);
    await page.screenshot({
      path: join(outDir, `projects-iphone-se-scroll-${i * 300}.png`),
      fullPage: false,
    });
  }

  await page.close();
  await context.close();
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
