const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // Fill password and click Enter
  try {
    await page.fill('input[type="password"]', 'henryloveshorseracing', { timeout: 2000 });
    await page.click('button:has-text("Enter")', { timeout: 2000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('No password dialog');
  }
  
  await page.screenshot({ path: 'mobile-header-test2.png', fullPage: false });
  await browser.close();
})();
