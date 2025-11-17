const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Check what's actually rendered
  const html = await page.content();
  console.log('Current URL:', page.url());
  
  // Look for Sign In button
  const signInButton = await page.locator('text=Sign In').count();
  const signUpButton = await page.locator('text=Sign Up').count();
  
  console.log('Sign In buttons found:', signInButton);
  console.log('Sign Up buttons found:', signUpButton);
  
  // If found, take a screenshot focusing on the top right where buttons should be
  if (signInButton > 0 || signUpButton > 0) {
    // Get the bounding box of the header
    const header = await page.locator('header').first();
    if (await header.isVisible()) {
      const box = await header.boundingBox();
      console.log('Header box:', box);
      await page.screenshot({ path: 'header-with-buttons.png', clip: box });
    }
  }
  
  await browser.close();
})();
