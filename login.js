const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto(
    "https://docs.google.com/forms/d/e/1FAIpQLSc8RRUAG8n8nPB9dm21m_MxwHQ-JuDnEj7GnvwEkWXykkKFuQ/viewform",
    {
      waitUntil: "domcontentloaded"
    }
  );

  console.log("Browser opened.");
  console.log("Sign into your Google account manually.");
  console.log("Complete any Google verification.");
  console.log("Then return to this terminal.");

  await page.waitForTimeout(60000);

  await context.storageState({
    path: "auth.json"
  });

  console.log("Authentication saved to auth.json");

  await browser.close();
})();

