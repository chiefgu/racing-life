const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  
  // Navigate directly to /home instead of landing page
  await page.goto('http://localhost:3000/home');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'mobile-header-test3.png', fullPage: false });
  await browser.close();
})();
