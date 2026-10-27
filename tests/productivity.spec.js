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


test("task editor updates notes, recurrence, checklist, subtasks and location", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator('[data-screen="productivity"]').click();
  await page.locator("#productAddTask").click();
  const form = page.locator("#productTaskForm");
  await form.locator('[name="title"]').fill("Detailed task");
  await form.locator('[name="notes"]').fill("Keep the reference");
  await form.locator('[name="location"]').fill("Library");
  await form.locator('[name="recurrence"]').selectOption("weekly");
  await form.locator('[name="checklist"]').fill("Read brief\nReview notes");
  await form.locator('[name="subtasks"]').fill("Collect sources");
  await form.locator('button[type="submit"]').click();
  const task = page.locator("#productTaskRows .product-task").filter({ hasText: "Detailed task" });
  await expect(task).toContainText("Keep the reference");
  await task.locator('[data-action="edit"]').click();
  await expect(form.locator('[name="notes"]')).toHaveValue("Keep the reference");
  await form.locator('[name="notes"]').fill("Updated reference");
  await form.locator('button[type="submit"]').click();
  await expect(page.locator("#productTaskRows")).toContainText("Updated reference");
  expect(errors).toEqual([]);
});

test("calendar month navigation and inline natural-language quick add work", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-screen="productivity"]').click();
  await page.locator("#productView").selectOption("calendar");
  const month = page.locator(".product-calendar-head h3");
  const firstMonth = await month.textContent();
  await page.locator("#productCalendarNext").click();
  await expect(month).not.toHaveText(firstMonth);
  await page.locator("#productCalendarToday").click();
  await page.locator("#productView").selectOption("list");
  await page.locator("#productQuickAdd").click();
  await page.locator("#productQuickInput").fill("Prepare report tomorrow #work !high");
  await page.locator("#productQuickInput").press("Enter");
  const task = page.locator("#productTaskRows .product-task").filter({ hasText: "Prepare report" });
  await expect(task).toContainText("high priority");
  await expect(task).toContainText("work");
});

test("completed task can be undone from the task toolbar", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-screen="productivity"]').click();
  await page.locator("#productAddTask").click();
  await page.locator('#productTaskForm [name="title"]').fill("Undo test");
  await page.locator('#productTaskForm button[type="submit"]').click();
  await page.locator("#productTaskRows .product-task").filter({ hasText: "Undo test" }).locator('[data-action="toggle"]').check();
  await page.locator("#productUndo").click();
  await expect(page.locator("#productTaskRows .product-task").filter({ hasText: "Undo test" }).locator('[data-action="toggle"]')).not.toBeChecked();
});


test("day, week, agenda and year views render and navigate", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator('[data-screen="productivity"]').click();
  const view = page.locator("#productView");
  for (const value of ["day", "week", "agenda", "year", "calendar"]) {
    await view.selectOption(value);
    await expect(page.locator("#productivityContent")).not.toBeEmpty();
    await expect(page.locator("#productCalendarNext")).toBeVisible();
    await page.locator("#productCalendarNext").click();
    await page.locator("#productCalendarToday").click();
  }
  await view.selectOption("list");
  expect(errors).toEqual([]);
});
