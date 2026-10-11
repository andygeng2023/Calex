const { test, expect } = require("@playwright/test");

async function seedEvents(page, offsets) {
  await page.addInitScript((eventOffsets) => {
    const dateKey = (offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
    };
    localStorage.setItem(
      "calex-guest-events-v1",
      JSON.stringify(
        eventOffsets.map((offset, index) => ({
          id: "quick-ui-fixture-" + index,
          title: "Fixture event " + index,
          date: dateKey(offset),
          start: "",
          end: "",
          repeat: "none",
          repeatInterval: 1,
          repeatUnit: "",
          description: "",
          location: "",
          people: "",
          notes: "",
          category: "personal",
          tag: "",
          done: false,
        })),
      ),
    );
  }, offsets);
}

test("home content scrolls as one page, including the date hero", async ({
  page,
}) => {
  await seedEvents(page, Array.from({ length: 24 }, () => 0));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const home = page.locator("#homeScreen");
  await expect(home).toHaveClass(/active/);
  const dimensions = await home.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);

  await home.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect.poll(() => home.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect
    .poll(() =>
      page.locator(".day-hero").evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBeLessThan(0);
});

test("Quick Add starts with its hint and previews the parsed repeat interval", async ({
  page,
}) => {
  await seedEvents(page, []);
  await page.goto("/");
  await page.locator("#homeQuickAdd").click();

  const preview = page.locator("#quickPreview");
  await expect(preview).toHaveText("Start typing to see the preview...");
  await page.locator("#quickText").fill("Dentist tomorrow every 2 weeks");
  await expect(preview).toContainText("Repeats every 2 weeks");
  await expect(preview).not.toContainText("Repeats daily");

  await page.locator("#quickText").fill("");
  await expect(preview).toHaveText("Start typing to see the preview...");
  await expect(preview).toHaveClass(/is-empty/);
});

test("Quick Add empty preview follows dark appearance", async ({ page }) => {
  await seedEvents(page, []);
  await page.goto("/");
  await page.locator('[data-screen="settings"]').click();
  await page.locator("#appearanceToggle").click();
  await expect(page.locator("body")).toHaveClass(/settings-dark/);
  await page.locator('[data-screen="home"]').click();
  await page.locator("#homeQuickAdd").click();

  const preview = page.locator("#quickPreview");
  await expect(preview).toHaveText("Start typing to see the preview...");
  const appearance = await preview.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, color: style.color };
  });
  expect(appearance.background).toBe("rgb(20, 28, 22)");
  expect(appearance.color).toBe("rgb(162, 175, 165)");
});

test("Coming up is a peer of Today and disappears when empty", async ({ page }) => {
  await seedEvents(page, [0, 1]);
  await page.goto("/");

  const comingUpHeading = page.locator("#comingUpHeading");
  await expect(comingUpHeading).toBeVisible();
  await expect(page.locator("#comingUpEvents")).toContainText("Fixture event 1");
  const hierarchy = await page.locator("#homeScreen").evaluate((home) => ({
    todayParent: home.querySelector(".section-heading").parentElement.id,
    comingUpParent: home.querySelector("#comingUpHeading").parentElement.id,
    headingCount: home.querySelectorAll(":scope > .section-heading").length,
  }));
  expect(hierarchy).toEqual({
    todayParent: "homeScreen",
    comingUpParent: "homeScreen",
    headingCount: 2,
  });

  await seedEvents(page, []);
  await page.reload();
  await expect(page.locator("#comingUpHeading")).toBeHidden();
  await expect(page.locator("#comingUpEvents")).toBeHidden();
});

test("event checkboxes align to the center of their event row", async ({ page }) => {
  await seedEvents(page, [0]);
  await page.goto("/");

  const row = page.locator("#todayEvents .event").first();
  await expect(row).toBeVisible();
  const alignment = await row.evaluate((event) => {
    const checkbox = event.querySelector(":scope > input.check");
    const rowRect = event.getBoundingClientRect();
    const checkRect = checkbox.getBoundingClientRect();
    return {
      horizontalOffset: Math.abs(
        checkRect.left + checkRect.width / 2 - (rowRect.left + 12),
      ),
      verticalOffset: Math.abs(
        checkRect.top + checkRect.height / 2 - (rowRect.top + rowRect.height / 2),
      ),
    };
  });
  expect(alignment.horizontalOffset).toBeLessThan(1);
  expect(alignment.verticalOffset).toBeLessThan(1);
});
