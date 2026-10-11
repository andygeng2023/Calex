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
  await expect(page.locator("#toast")).toContainText("Event added");
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
