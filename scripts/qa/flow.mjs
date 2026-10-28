// The main journey, end to end in the static build: add a client, start a project from a template, tick a check,
// add a task for the client, approve a milestone in their portal and see it back on the board.
export async function flow({ browser, base }) {
  const problems = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (e) => problems.push(`flow: page error: ${e.message}`));
  const step = async (name, fn) => {
    try { await fn(); process.stdout.write(`flow ${name} ✓\n`); }
    catch (e) { problems.push(`flow ${name}: ${e.message.split("\n")[0]}`); throw e; }
  };
  try {
    await page.goto(`${base}/`);
    await page.locator("[data-stage]").first().waitFor();
    await step("add a client", async () => {
      await page.getByRole("button", { name: "Add client" }).click();
      const dialog = page.getByRole("dialog", { name: "Add a client" });
      await dialog.getByLabel("Client name").fill("QA Bakery");
      await dialog.getByRole("button", { name: "Add client" }).click();
      await page.getByRole("heading", { level: 1, name: "QA Bakery" }).waitFor();
    });
    await step("start a project from the template", async () => {
      await page.getByRole("button", { name: "New project" }).click();
      const dialog = page.getByRole("dialog", { name: "New project" });
      await dialog.getByLabel("Project name").fill("Bakery site");
      await dialog.getByRole("radio", { name: /^Website/ }).check();
      await dialog.getByRole("button", { name: "Create project" }).click();
      await page.getByRole("heading", { level: 3, name: "Bakery site" }).waitFor();
    });
    await step("tick a template check", async () => {
      await page.getByRole("checkbox", { name: "Brief, goals and what success looks like" }).click();
      await page.getByText(/^\d+%$/).filter({ hasNotText: "0%" }).first().waitFor();
    });
    await step("add a task for the client", async () => {
      await page.getByRole("tab", { name: /^Tasks/ }).click();
      await page.getByLabel("Add a task").fill("Send the menu photos");
      await page.getByRole("button", { name: "Add", exact: true }).click();
      await page.getByRole("button", { name: /Send the menu photos: assigned to Studio/ }).click();
      await page.getByRole("menuitemradio", { name: /^Client/ }).or(page.getByRole("menuitem", { name: /^Client/ })).first().click();
      await page.getByRole("button", { name: /Send the menu photos: assigned to Client/ }).waitFor();
    });
    await step("approve a milestone in the portal", async () => {
      await page.goto(`${base}/portal/?c=northlight`);
      await page.getByRole("button", { name: "Approve this milestone" }).click();
      await page.getByText("Approved: Proposal sent").first().waitFor();
    });
    await step("the approval shows on the board", async () => {
      await page.goto(`${base}/?c=northlight&tab=notes`);
      await page.getByText("Approved: Proposal sent").first().waitFor();
    });
    await step("the client's own task shows in their portal", async () => {
      await page.goto(`${base}/`);
      await page.getByRole("link", { name: "QA Bakery" }).first().click();
      await page.waitForURL(/[?&]c=/);
      const id = new URL(page.url()).searchParams.get("c");
      await page.goto(`${base}/portal/?c=${id}`);
      await page.getByText("Send the menu photos").waitFor();
    });
  } catch { /* recorded in problems */ }
  await context.close();
  return problems;
}
