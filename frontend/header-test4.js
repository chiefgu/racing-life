const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  
  // Navigate to dashboard which should have EditorialHeader
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'mobile-header-dashboard.png', fullPage: false });
  await browser.close();
})();
