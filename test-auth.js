const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext({
    storageState: "auth.json"
  });

  const page = await context.newPage();

  await page.goto(
    "https://docs.google.com/forms/d/e/1FAIpQLSc8RRUAG8n8nPB9dm21m_MxwHQ-JuDnEj7GnvwEkWXykkKFuQ/viewform",
    {
      waitUntil: "networkidle"
    }
  );

  console.log("Form opened using saved authentication.");
  console.log("Leave the browser open.");

  await page.waitForTimeout(600000);

  await browser.close();
})();
