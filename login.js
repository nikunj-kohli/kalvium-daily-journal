const { chromium } = require("playwright");
const readline = require("readline");
const { execSync } = require("child_process");

(async () => {
  console.log("Launching browser for Google Sign-in...");
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  await page.goto(
    "https://docs.google.com/forms/d/e/1FAIpQLSc8RRUAG8n8nPB9dm21m_MxwHQ-JuDnEj7GnvwEkWXykkKFuQ/viewform",
    { waitUntil: "domcontentloaded" }
  );

  console.log("\n========================================================");
  console.log("1. Sign into your Google account (nikunj.kohli.s85@kalvium.community).");
  console.log("2. Complete any 2FA or device verification in the browser.");
  console.log("3. Once the Google Form is visible, come back to this terminal");
  console.log("   and press [ENTER].");
  console.log("========================================================\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  await new Promise(resolve => {
    rl.question("Press [ENTER] to save authentication and finish: ", () => {
      rl.close();
      resolve();
    });
  });

  await context.storageState({
    path: "auth.json"
  });

  console.log("\n Authentication saved to auth.json successfully!");

  try {
    const base64Auth = execSync("base64 -i auth.json").toString().trim();
    execSync("pbcopy", { input: base64Auth });
    console.log(" Copied base64 PLAYWRIGHT_AUTH directly to your clipboard!");
    console.log("Now go to GitHub: Repository Settings -> Secrets and variables -> Actions -> PLAYWRIGHT_AUTH and paste it.\n");
  } catch (e) {
    console.log("To copy your auth token to clipboard, run:");
    console.log("  base64 -i auth.json | pbcopy\n");
  }

  await browser.close();
})();
