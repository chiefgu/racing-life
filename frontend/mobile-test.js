const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Take full page screenshot
  await page.screenshot({ path: 'mobile-header-full.png', fullPage: true });
  
  // Take screenshot of just the header area
  await page.screenshot({ path: 'mobile-header-top.png', clip: { x: 0, y: 0, width: 390, height: 200 } });
  
  console.log('Screenshots taken');
  await browser.close();
})();
