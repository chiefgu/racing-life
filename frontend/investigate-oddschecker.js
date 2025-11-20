const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to Oddschecker...');
  await page.goto('https://www.oddschecker.com/horse-racing/kelso/12:55/winner', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Wait for the odds table to load
  await page.waitForTimeout(3000);

  // Take a screenshot
  await page.screenshot({
    path: 'oddschecker-screenshot.png',
    fullPage: true
  });
  console.log('Screenshot saved to oddschecker-screenshot.png');

  // Get the HTML structure of the odds table
  const tableHTML = await page.evaluate(() => {
    // Try to find the odds comparison table
    const table = document.querySelector('table') ||
                  document.querySelector('[class*="odds"]') ||
                  document.querySelector('[class*="table"]');
    return table ? table.outerHTML.substring(0, 5000) : 'Table not found';
  });

  console.log('\n--- Table HTML Structure (first 5000 chars) ---');
  console.log(tableHTML);

  // Get information about the table structure
  const tableInfo = await page.evaluate(() => {
    const tables = document.querySelectorAll('table');
    return Array.from(tables).map((table, idx) => {
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      const firstRowCells = Array.from(table.querySelectorAll('tbody tr:first-child td')).map(td => td.textContent.trim());
      return {
        index: idx,
        headers: headers,
        firstRowSample: firstRowCells.slice(0, 5),
        rowCount: table.querySelectorAll('tbody tr').length,
        classes: table.className
      };
    });
  });

  console.log('\n--- Table Information ---');
  console.log(JSON.stringify(tableInfo, null, 2));

  await browser.close();
})();
