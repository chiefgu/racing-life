const { chromium } = require('playwright');

async function showcaseHeader() {
  console.log('🎨 Showcasing New Professional Header with Mega Menu\n');
  console.log('══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    // Load homepage
    console.log('📍 Loading homepage with new header...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Screenshot 1: Header at top (large logo visible)
    console.log('📸 Capturing header with large logo...');
    await page.screenshot({
      path: 'screenshots-showcase/header-top.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 100 },
    });

    // Open mega menu
    console.log('📍 Opening mega menu...');
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(1000);

    // Screenshot 2: Mega menu open
    console.log('📸 Capturing mega menu...');
    await page.screenshot({
      path: 'screenshots-showcase/mega-menu-open.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 600 },
    });

    // Close mega menu and scroll down
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(500);

    console.log('📍 Scrolling to show small logo...');
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(1000);

    // Screenshot 3: Header scrolled (small logo visible)
    console.log('📸 Capturing header with small logo on scroll...');
    await page.screenshot({
      path: 'screenshots-showcase/header-scrolled.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 100 },
    });

    // Full page screenshot with new header
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('📸 Capturing full page with new header...');
    await page.screenshot({
      path: 'screenshots-showcase/full-page-new-header.png',
      fullPage: true,
    });

    // Test mobile responsive
    console.log('\n📱 Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'screenshots-showcase/mobile-header.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 200 },
    });

    console.log('\n══════════════════════════════════════════════════');
    console.log('✅ Professional Header Implementation Complete!\n');
    console.log('🎯 Key Features:');
    console.log('  • Dynamic logo switching on scroll');
    console.log('  • Full-width mega menu with categories');
    console.log('  • Racing Hub links organized in columns');
    console.log('  • Featured races section');
    console.log('  • Tools & community quick links');
    console.log('  • Smooth animations with Framer Motion');
    console.log('  • Fully responsive design');
    console.log('\n📁 Screenshots saved in: ./screenshots-showcase/');
    console.log('══════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

showcaseHeader().catch(console.error);
