const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureAPI() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Capture API Health
    console.log('📍 Capturing API Health Check...');
    await page.goto('http://localhost:3001/health', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(__dirname, 'screenshots-showcase', '10-api-health.png'),
    });
    console.log('✅ Saved: 10-api-health.png');

    // Capture API Docs
    console.log('📍 Capturing API Documentation...');
    await page.goto('http://localhost:3001/api-docs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(__dirname, 'screenshots-showcase', '11-api-docs.png'),
      fullPage: true,
    });
    console.log('✅ Saved: 11-api-docs.png');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureAPI();
