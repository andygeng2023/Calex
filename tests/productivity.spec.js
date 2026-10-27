const { test, expect } = require("@playwright/test");

test("productivity workspace creates and persists a task", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator('[data-screen="productivity"]').click();
  await expect(page.locator("#productivityScreen")).toHaveClass(/active/);
  await page.locator("#productAddTask").click();
  await page.locator('#productTaskForm [name="title"]').fill("Parity task smoke test");
  await page.locator('#productTaskForm [name="due"]').fill("2026-11-03");
  await page.locator('#productTaskForm [name="priority"]').selectOption("high");
  await page.locator('#productTaskForm button[type="submit"]').click();
  await expect(page.locator("#productTaskRows")).toContainText("Parity task smoke test");
  await page.reload();
  await page.locator('[data-screen="productivity"]').click();
  await expect(page.locator("#productTaskRows")).toContainText("Parity task smoke test");
  expect(errors).toEqual([]);
});

test("completed tasks can be archived and restored", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-screen="productivity"]').click();
  await page.locator("#productAddTask").click();
  await page.locator('#productTaskForm [name="title"]').fill("Archive flow test");
  await page.locator('#productTaskForm button[type="submit"]').click();
  const task = page.locator("#productTaskRows .product-task").filter({ hasText: "Archive flow test" });
  await task.locator('[data-action="toggle"]').check();
  await page.locator('[data-product-tab="archive"]').click();
  await page.locator("#archiveCompleted").click();
  await expect(page.locator("#productivityContent")).toContainText("Archive flow test");
  await page.locator('[data-restore-archive]').click();
  await page.locator('[data-product-tab="tasks"]').click();
  await expect(page.locator("#productTaskRows")).toContainText("Archive flow test");
});

test("advanced productivity views open without runtime errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator('[data-screen="productivity"]').click();
  for (const tab of ["matrix", "timeline", "archive", "trash", "templates", "insights", "settings", "habits", "focus", "notes", "countdowns"]) {
    await page.locator('[data-product-tab="' + tab + '"]').click();
    await expect(page.locator("#productivityContent")).not.toBeEmpty();
  }
  expect(errors).toEqual([]);
});
