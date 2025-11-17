const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  
  // Navigate to home page (assuming /home route or clicking Enter Site)
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Try to click Enter Site button if it exists
  const enterButton = await page.locator('text=Enter Site').first();
  if (await enterButton.isVisible()) {
    await enterButton.click();
    await page.waitForLoadState('networkidle');
  }
  
  // Take screenshot of the header
  await page.screenshot({ path: 'mobile-home-header.png', clip: { x: 0, y: 0, width: 390, height: 150 } });
  
  console.log('Home page header screenshot taken');
  await browser.close();
})();
