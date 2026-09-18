import { chromium, devices } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'reports', 'mobile-screenshots');
mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.BASE_URL || 'http://localhost:4321/';

const pages = [
  { path: '', name: 'home' },
  { path: 'projects/', name: 'projects' },
  { path: 'about/', name: 'about' },
  { path: 'writing/', name: 'writing' },
  { path: 'contact/', name: 'contact' },
];

const viewports = [
  { name: 'iphone-se', width: 375, height: 667, deviceScaleFactor: 2 },
  { name: 'iphone-14', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'pixel-7', width: 412, height: 915, deviceScaleFactor: 2.625 },
];

async function run() {
  const browser = await chromium.launch();

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      userAgent: devices['iPhone 14']?.userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    });

    for (const pageInfo of pages) {
      const page = await context.newPage();
      const url = `${baseUrl}${pageInfo.path}`;
      console.log(`Capturing ${url} at ${vp.name}`);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        // Wait for reveal animations / shader settle
        await page.waitForTimeout(1500);

        // Full-page screenshot
        await page.screenshot({
          path: join(outDir, `${pageInfo.name}-${vp.name}.png`),
          fullPage: true,
        });

        // Above-the-fold viewport screenshot
        await page.screenshot({
          path: join(outDir, `${pageInfo.name}-${vp.name}-viewport.png`),
          fullPage: false,
        });
      } catch (err) {
        console.error(`Failed ${url} @ ${vp.name}: ${err.message}`);
      } finally {
        await page.close();
      }
    }

    await context.close();
  }

  await browser.close();
  console.log(`Screenshots saved to ${outDir}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
