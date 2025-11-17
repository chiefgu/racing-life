const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  
  // Set the site_access cookie
  await context.addCookies([{
    name: 'site_access',
    value: 'true',
    domain: 'localhost',
    path: '/'
  }]);
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  console.log('Current URL:', page.url());
  
  // Take full page screenshot
  await page.screenshot({ path: 'home-with-cookie-full.png', fullPage: true });
  
  // Take screenshot of just the header
  await page.screenshot({ path: 'home-header.png', clip: { x: 0, y: 0, width: 390, height: 200 } });
  
  console.log('Screenshots taken');
  await browser.close();
})();
