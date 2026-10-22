const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  if (!fs.existsSync("auth.json")) {
    console.error("[ERROR] auth.json not found! Authentication state is required.");
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled"
    ]
  });

  const context = await browser.newContext({
    storageState: "auth.json",
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  try {
    console.log("Navigating to Kalvium journal form...");
    await page.goto(
      "https://docs.google.com/forms/d/e/1FAIpQLSc8RRUAG8n8nPB9dm21m_MxwHQ-JuDnEj7GnvwEkWXykkKFuQ/viewform",
      { waitUntil: "networkidle", timeout: 45000 }
    );

    const currentUrl = page.url();
    console.log(`Current page URL: ${currentUrl}`);

    // Check if redirected to Google sign-in or verification challenge
    if (currentUrl.includes("accounts.google.com")) {
      await page.screenshot({ path: "error.png", fullPage: true });
      throw new Error(
        "Google authentication failed or expired: Google redirected to sign-in / verification challenge ('Verify that it's you'). " +
        "Please run 'node login.js' locally, update the GitHub secret PLAYWRIGHT_AUTH, and re-run."
      );
    }

    // Page 1: Record email checkbox (if present)
    const emailCheckbox = page.getByRole("checkbox", { name: /Record .* as the email/i });
    try {
      if (await emailCheckbox.isVisible({ timeout: 5000 })) {
        const isChecked = await emailCheckbox.isChecked();
        if (!isChecked) {
          await emailCheckbox.click();
          console.log("Checked record email checkbox.");
        } else {
          console.log("Record email checkbox already checked.");
        }
      }
    } catch (e) {
      console.log("Notice: Record email checkbox not displayed or already checked.");
    }

    // Working day radio button: uniquely match "It was a working day, and I was present"
    const workingDayRadio = page.getByRole("radio", {
      name: /and I was present/i
    });
    await workingDayRadio.waitFor({ state: "visible", timeout: 15000 });
    await workingDayRadio.click();
    console.log("Selected: It was a working day, and I was present.");

    // Next button to Page 2
    const nextBtn1 = page.getByRole("button", { name: "Next" });
    await nextBtn1.waitFor({ state: "visible", timeout: 10000 });
    await nextBtn1.click();
    await page.waitForTimeout(2000);

    // Page 2: Text inputs
    console.log("Filling daily journal answers...");
    const keyTasksInput = page.getByRole("textbox", {
      name: /What were your key tasks/i
    });
    await keyTasksInput.waitFor({ state: "visible", timeout: 15000 });
    await keyTasksInput.fill("work");

    const challengesInput = page.getByRole("textbox", {
      name: /What challenges\/problems did/i
    });
    await challengesInput.fill("work");

    const escalationsInput = page.getByRole("textbox", {
      name: /What challenges\/problems you/i
    });
    await escalationsInput.fill("NA");

    const planInput = page.getByRole("textbox", {
      name: /What is your plan for the/i
    });
    await planInput.fill("work");

    // Next button to Final page
    const nextBtn2 = page.getByRole("button", { name: "Next" });
    await nextBtn2.waitFor({ state: "visible", timeout: 10000 });
    await nextBtn2.click();
    await page.waitForTimeout(2000);

    // Final Page: Submit
    const submitBtn = page.getByRole("button", { name: "Submit" });
    await submitBtn.waitFor({ state: "visible", timeout: 15000 });
    await submitBtn.click();
    await page.waitForTimeout(3000);

    console.log("Journal submitted successfully!");
  } catch (err) {
    console.error("[ERROR]", err.message);
    try {
      await page.screenshot({ path: "error.png", fullPage: true });
      console.log("Saved failure screenshot to error.png");
    } catch (screenshotErr) {
      console.error("Could not save screenshot:", screenshotErr.message);
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
