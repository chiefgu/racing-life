const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Click "Enter Site" if it exists to get past landing page
  try {
    await page.click('text=Enter Site', { timeout: 2000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    // Already on main page
  }
  
  await page.screenshot({ path: 'mobile-header-test.png', fullPage: false });
  await browser.close();
})();
