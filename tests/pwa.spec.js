const { test, expect } = require("@playwright/test");

test("calendar loads and core navigation works", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.locator("#homeScreen")).toHaveClass(/active/);
  await expect(page.locator("#heroDate")).not.toBeEmpty();

  await page.locator('[data-screen="calendar"]').click();
  await expect(page.locator("#calendarScreen")).toHaveClass(/active/);
  await expect(page.locator("#monthTitle")).not.toBeEmpty();
  await expect(page.locator("[data-date]").first()).toBeVisible();

  await page.locator("[data-date]").first().click();
  await page.locator("#panelAdd").click();
  await expect(page.locator("#eventForm")).toBeVisible();
  await page.locator("#eventTitle").fill("Playwright smoke test");
  await page.locator("#eventDate").fill("2026-10-12");
  await page.locator('#eventForm button[type="submit"]').click();
  await expect(page.locator("#toast")).toContainText("Task added");
  await expect(page.locator("#panelEvents")).toContainText(
    "Playwright smoke test",
  );

  expect(pageErrors).toEqual([]);
});

test("dark appearance covers the calendar and event form surfaces", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-screen="settings"]').click();
  await expect(page.locator("#settingsScreen")).toHaveClass(/active/);
  await page.locator("#appearanceToggle").click();
  await expect(page.locator(".app")).toHaveClass(/settings-dark/);
  await expect(page.locator("body")).toHaveClass(/settings-dark/);

  const shellBackground = await page
    .locator(".app")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(shellBackground).not.toBe("rgb(255, 255, 255)");

  await page.locator('[data-screen="calendar"]').click();
  const calendarSurface = await page
    .locator(".date-cell:not(.selected)")
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(calendarSurface).not.toBe("rgb(255, 255, 255)");

  await page.locator("[data-date]").first().click();
  await page.locator("#panelAdd").click();
  await expect(page.locator("#eventForm")).toBeVisible();
  const modalSurface = await page
    .locator(".modal")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(modalSurface).not.toBe("rgb(255, 255, 255)");

  const formControlSurface = await page
    .locator("#eventTitle")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(formControlSurface).not.toBe("rgb(255, 255, 255)");
});

test("manifest is linked and service worker enables offline shell", async ({
  page,
  context,
}) => {
  await page.goto("/");
  expect(await page.locator('link[rel="manifest"]').getAttribute("href")).toBe(
    "./manifest.webmanifest",
  );

  const manifestResponse = await page.request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("./");

  const waitForController = () =>
    page.waitForFunction(
      () =>
        "serviceWorker" in navigator &&
        navigator.serviceWorker.controller !== null,
      null,
      { timeout: 10_000 },
    );
  try {
    await waitForController();
  } catch {
    await page.reload();
    await waitForController();
  }

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#homeScreen")).toHaveClass(/active/);
  await expect(page.locator("#heroDate")).not.toBeEmpty();
});

test("deleting an event can be undone", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-screen="calendar"]').click();
  await page.locator("[data-date]").first().click();
  await page.locator("#panelAdd").click();
  await page.locator("#eventTitle").fill("Undo me");
  await page.locator("#eventDate").fill("2026-10-12");
  await page.locator('#eventForm button[type="submit"]').click();
  await page.locator("#panelEvents [data-edit]").first().click();
  await page.locator(".delete-event").click();
  await expect(page.locator("#toast")).toContainText("Event deleted");
  await page.locator(".toast-action").click();
  await expect(page.locator("#toast")).toContainText("Event restored");
});

test("importing an .ics file adds events and skips duplicates", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-screen="settings"]').click();
  const ics =
    "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:t1\r\nSUMMARY:Imported dentist\r\nDTSTART:20261020T093000\r\nDTEND:20261020T103000\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
  const file = {
    name: "a.ics",
    mimeType: "text/calendar",
    buffer: Buffer.from(ics),
  };
  await page.locator("#importFile").setInputFiles(file);
  await expect(page.locator("#toast")).toContainText("Imported 1 event");
  await page.locator("#importFile").setInputFiles(file);
  await expect(page.locator("#toast")).toContainText("Nothing new to import");
});

test("Today button returns the calendar to the current month", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-screen="calendar"]').click();
  await page.locator("#nextMonth").click();
  await page.locator("#goToday").click();
  await expect(page.locator("#monthTitle")).toContainText(
    String(new Date().getFullYear()),
  );
});


test("calendar task actions are not duplicated and use task labels", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-screen="calendar"]').click();
  await expect(page.locator("#panelQuick")).toHaveText("Quick task");
  await expect(page.locator("#panelAdd")).toHaveText("Add task");
  await expect(page.locator("#panelTask")).toHaveCount(0);
  await page.locator("#panelQuick").click();
  await expect(page.locator("#modalTitle")).toHaveText("Quick task");
  await page.locator("#quickText").fill("Quickly captured task");
  await page.locator("#quickSave").click();
  await expect(page.locator("#toast")).toContainText("Task added");
});

test("tasks use the compact calendar form and support recursively nested subtasks", async ({ page }) => {
  await page.goto("/");
  await page.locator("#homeAddTask").click();
  await expect(page.locator("#modalBackdrop")).toHaveAttribute("data-mode", "task");
  await expect(page.locator("#modalTitle")).toHaveText("New task");
  await expect(page.locator("#eventLocation").locator("xpath=..")).toBeHidden();
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  await page.locator("#eventTitle").fill("Nested task smoke test");
  await page.locator("#eventDate").fill(date);
  await page.locator('#eventForm button[type="submit"]').click();
  await expect(page.locator("#toast")).toContainText("Task added");
  await page.locator('[data-date="' + date + '"]').click();
  const task = page.locator('#panelEvents .event').filter({ hasText: "Nested task smoke test" });
  await expect(task).toBeVisible();

  await expect(task.locator("[data-add-subtask]")).toBeVisible();
  await task.locator("[data-add-subtask]").first().click();
  await expect(page.locator("#modalTitle")).toHaveText("Quick task · Add subtask");
  await page.locator("#quickText").fill("First-level subtask");
  await page.locator("#quickSave").click();
  await expect(page.locator("#toast")).toContainText("Subtask added");
  await expect(task).toContainText("First-level subtask");

  await task.locator("[data-add-subtask]").last().click();
  await expect(page.locator("#modalTitle")).toHaveText("Quick task · Add subtask");
  await page.locator("#quickText").fill("Nested child");
  await page.locator("#quickSave").click();
  await expect(page.locator("#toast")).toContainText("Subtask added");
  await expect(task).toContainText("Nested child");
  await expect(task.locator(".event-subtasks .event-subtasks")).toBeVisible();
  await task.locator("[data-subtask-toggle]").last().check();
  await expect(task.locator("[data-subtask-toggle]").last()).toBeChecked();
});

test("Home and Special features remain usable at a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator("#homeOverdueHeading")).toBeVisible();
  await expect(page.locator("#homeTimelineHeading")).toBeVisible();
  await expect(page.locator("#homeInsights")).toBeVisible();
  await page.locator('[data-screen="productivity"]').click();
  await expect(page.locator("#productivityScreen")).toHaveClass(/active/);
  await expect(page.locator('[data-product-tab="focus"]')).toBeVisible();
  await expect(page.locator('[data-product-tab="matrix"]')).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
});


test("top bar is removed from layout and sidebar is wider", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const layout = await page.evaluate(() => ({
    topbar: getComputedStyle(document.querySelector(".topbar")).display,
    sidebar: document.querySelector(".bottom-nav").getBoundingClientRect().width,
    mainTop: document.querySelector("#mainContent").getBoundingClientRect().top,
  }));
  expect(layout.topbar).toBe("none");
  expect(layout.sidebar).toBeGreaterThanOrEqual(300);
  expect(layout.mainTop).toBe(0);
});

test("completing a parent task completes all nested subtasks", async ({ page }) => {
  await page.goto("/");
  await page.locator("#homeAddTask").click();
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  await page.locator("#eventTitle").fill("Cascade parent smoke");
  await page.locator("#eventDate").fill(date);
  await page.locator('#eventForm button[type="submit"]').click();
  await page.locator('[data-date="' + date + '"]').click();
  const parent = page.locator("#panelEvents .event").filter({ hasText: "Cascade parent smoke" });
  await parent.locator("[data-add-subtask]").first().click();
  await page.locator("#quickText").fill("Cascade child");
  await page.locator("#quickSave").click();
  await parent.locator("[data-add-subtask]").last().click();
  await page.locator("#quickText").fill("Cascade nested child");
  await page.locator("#quickSave").click();
  await parent.locator("[data-check]").check();
  await expect(parent.locator("[data-subtask-toggle]")).toHaveCount(2);
  await expect(parent.locator("[data-subtask-toggle]").nth(0)).toBeChecked();
  await expect(parent.locator("[data-subtask-toggle]").nth(1)).toBeChecked();
});


test("completing one recurring occurrence leaves other dates and their subtasks open", async ({ page }) => {
  await page.goto("/");
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrow = [tomorrowDate.getFullYear(), String(tomorrowDate.getMonth() + 1).padStart(2, "0"), String(tomorrowDate.getDate()).padStart(2, "0")].join("-");
  await page.locator("#homeAddTask").click();
  await page.locator("#eventTitle").fill("Daily recurring smoke");
  await page.locator("#eventDate").fill(today);
  await page.locator("#eventRepeat").selectOption("daily");
  await page.locator('#eventForm button[type="submit"]').click();
  await page.locator('[data-date="' + today + '"]').click();
  let parent = page.locator("#panelEvents .event").filter({ hasText: "Daily recurring smoke" });
  await expect(parent).toBeVisible();
  await parent.locator("[data-check]").check();
  await expect(parent.locator("[data-check]")).toBeChecked();
  await page.locator('[data-date="' + tomorrow + '"]').click();
  parent = page.locator("#panelEvents .event").filter({ hasText: "Daily recurring smoke" });
  await expect(parent).toBeVisible();
  await expect(parent.locator("[data-check]")).not.toBeChecked();
});


test("Special features tabs fit without horizontal scrolling and notes default to Markdown preview", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto("/");
  await page.locator('[data-screen="productivity"]').click();
  const tabs = page.locator(".product-tabs");
  await expect(tabs.locator('[data-product-tab="focus"]')).toBeVisible();
  await expect(tabs.locator('[data-product-tab="notes"]')).toBeVisible();
  await expect(tabs.locator('[data-product-tab="countdowns"]')).toBeVisible();
  await expect(tabs.locator('[data-product-tab="matrix"]')).toBeVisible();
  const dimensions = await tabs.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await tabs.locator('[data-product-tab="notes"]').click();
  await page.locator("#newNote").click();
  const note = page.locator(".product-note").first();
  await expect(note.locator(".product-note-preview")).toBeVisible();
  await expect(note.locator("textarea[data-body]")).toBeHidden();
  await expect(note.locator("[data-note-preview-toggle]")).toContainText("Edit note");
});

test("calendar overdue is first in the same scrollable selected-day panel and sidebar category selection is removed", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const panel = page.locator("#selectedPanel");
  const order = await panel.evaluate(el => Array.from(el.children).map(child => child.id || child.className));
  expect(order.indexOf("panel-overdue")).toBeLessThan(order.indexOf("panelEvents"));
  const overflow = await panel.evaluate(el => getComputedStyle(el).overflowY);
  expect(["auto", "scroll"]).toContain(overflow);
  await expect(page.locator(".bottom-nav .category-filters")).toHaveCount(0);
});

test("task cards are list rows with top-right tags and subtask actions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator("#homeAddTask").click();
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  await page.locator("#eventTitle").fill("List row smoke");
  await page.locator("#eventDate").fill(date);
  await page.locator('#eventForm button[type="submit"]').click();
  await page.locator('[data-date="' + date + '"]').click();
  const card = page.locator("#panelEvents .event").filter({ hasText: "List row smoke" });
  await expect(card).toBeVisible();
  const styles = await card.evaluate(el => ({ border: getComputedStyle(el).borderTopWidth, radius: getComputedStyle(el).borderRadius }));
  expect(styles.border).toBe("0px");
  expect(styles.radius).toBe("0px");
  await expect(card.locator(".event-card-tools")).toBeVisible();
});
