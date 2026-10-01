const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    storageState: "auth.json"
  });

  const page = await context.newPage();

  await page.goto(
    "https://docs.google.com/forms/d/e/1FAIpQLSc8RRUAG8n8nPB9dm21m_MxwHQ-JuDnEj7GnvwEkWXykkKFuQ/viewform",
    { waitUntil: "networkidle" }
  );

  // Page 1
  await page.getByRole('checkbox', { name: 'Record nikunj.kohli.s85@' }).click();

  await page.getByRole('radio', {
    name: 'It was a working day, and I'
  }).click();

  await page.getByRole('button', { name: 'Next' }).click();

  // Page 2
  await page.getByRole('textbox', {
    name: 'What were your key tasks for'
  }).fill('work');

  await page.getByRole('textbox', {
    name: 'What challenges/problems did'
  }).fill('work');

  await page.getByRole('textbox', {
    name: 'What challenges/problems you'
  }).fill('NA');

  await page.getByRole('textbox', {
    name: 'What is your plan for the'
  }).fill('work');

  await page.getByRole('button', { name: 'Next' }).click();

  // Final page
  await page.getByRole('button', { name: 'Submit' }).click();

  console.log("Journal submitted successfully.");

  await page.waitForTimeout(5000);

  await browser.close();
})();
