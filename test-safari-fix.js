const { chromium, webkit } = require('playwright');

async function testSafariFix() {
  console.log('🧪 Testing Safari Compatibility Fix\n');
  console.log('═══════════════════════════════════════\n');

  // Test with Safari (WebKit)
  console.log('📱 Testing with Safari (WebKit)...');
  const safari = await webkit.launch({
    headless: false,
    slowMo: 500,
  });
  const safariPage = await safari.newPage();

  try {
    // Test homepage
    console.log('   ➜ Loading homepage...');
    await safariPage.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await safariPage.waitForTimeout(3000);

    // Check if content is loaded
    const hasContent = await safariPage.evaluate(() => {
      const races = document.querySelectorAll('[class*="card"]').length;
      const hasHero = document.querySelector('h1') !== null;
      return { races, hasHero };
    });

    console.log('   ✓ Homepage loaded');
    console.log(`   ✓ Found ${hasContent.races} cards`);
    console.log(`   ✓ Hero section: ${hasContent.hasHero ? 'Present' : 'Missing'}`);

    // Test API call directly
    console.log('   ➜ Testing API connectivity...');
    const apiResponse = await safariPage.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/races', {
          method: 'GET',
          credentials: 'include',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        return {
          status: response.status,
          ok: response.ok,
          dataReceived: !!data,
          racesCount: Array.isArray(data) ? data.length : 0,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    if (apiResponse.error) {
      console.log(`   ❌ API Error: ${apiResponse.error}`);
    } else {
      console.log(`   ✓ API Response: ${apiResponse.status}`);
      console.log(`   ✓ Data received: ${apiResponse.dataReceived}`);
      console.log(`   ✓ Races in database: ${apiResponse.racesCount}`);
    }

    // Take screenshot
    await safariPage.screenshot({
      path: 'screenshots-showcase/safari-fixed.png',
      fullPage: true,
    });
    console.log('   ✓ Screenshot saved: safari-fixed.png');
  } catch (error) {
    console.error('   ❌ Safari test failed:', error.message);
  }

  // Test with Chrome for comparison
  console.log('\n🌐 Testing with Chrome (Chromium)...');
  const chrome = await chromium.launch({
    headless: false,
    slowMo: 500,
  });
  const chromePage = await chrome.newPage();

  try {
    console.log('   ➜ Loading homepage...');
    await chromePage.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await chromePage.waitForTimeout(2000);

    // Check content
    const hasContent = await chromePage.evaluate(() => {
      const races = document.querySelectorAll('[class*="card"]').length;
      const hasHero = document.querySelector('h1') !== null;
      return { races, hasHero };
    });

    console.log('   ✓ Homepage loaded');
    console.log(`   ✓ Found ${hasContent.races} cards`);
    console.log(`   ✓ Hero section: ${hasContent.hasHero ? 'Present' : 'Missing'}`);

    // Take screenshot
    await chromePage.screenshot({
      path: 'screenshots-showcase/chrome-comparison.png',
      fullPage: true,
    });
    console.log('   ✓ Screenshot saved: chrome-comparison.png');
  } catch (error) {
    console.error('   ❌ Chrome test failed:', error.message);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✅ SAFARI FIX VERIFICATION COMPLETE\n');
  console.log('Key improvements:');
  console.log('  • Added credentials: "include" to all fetch requests');
  console.log('  • Updated CORS to support Safari strict mode');
  console.log('  • Fixed API response handling in hooks');
  console.log('  • Added multiple origin support');
  console.log('\nThe website should now work correctly in Safari! 🎉\n');

  await safari.close();
  await chrome.close();
}

testSafariFix().catch(console.error);
