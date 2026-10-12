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

  await page.locator("#quickText").fill("Dentist tomorrow every 2 weeks");
  await page.locator("#quickSave").click();
  await expect(page.locator("#panelEvents")).toContainText("Dentist");
  await expect(page.locator("#panelEvents")).toContainText("Repeats every 2 weeks");
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
    const style = getComputedStyle(event);
    const columns = style.gridTemplateColumns.split(" ");
    const leftInset =
      parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
    const topInset =
      parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
    const contentHeight =
      rowRect.height -
      parseFloat(style.borderTopWidth) -
      parseFloat(style.borderBottomWidth) -
      parseFloat(style.paddingTop) -
      parseFloat(style.paddingBottom);
    return {
      horizontalOffset: Math.abs(
        checkRect.left +
          checkRect.width / 2 -
          (rowRect.left + leftInset + parseFloat(columns[0]) / 2),
      ),
      verticalOffset: Math.abs(
        checkRect.top +
          checkRect.height / 2 -
          (rowRect.top + topInset + contentHeight / 2),
      ),
      gridColumns: style.gridTemplateColumns,
      paddingLeft: style.paddingLeft,
    };
  });
  expect(alignment.horizontalOffset, JSON.stringify(alignment)).toBeLessThan(1);
  expect(alignment.verticalOffset, JSON.stringify(alignment)).toBeLessThan(1);
});



async function swipeCalendar(page, direction) {
  const scroller = page.locator("#calendarScroller");
  const box = await scroller.boundingBox();
  if (!box) throw new Error("Calendar scroller is not visible.");
  const y = box.y + box.height / 2;
  const startRatio = direction === "left" ? 0.8 : 0.2;
  const endRatio = direction === "left" ? 0.2 : 0.8;
  await page.mouse.move(box.x + box.width * startRatio, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * endRatio, y, { steps: 6 });
  const draggedTransform = await scroller.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.mouse.up();
  return draggedTransform;
}

function selectedDateKey(page) {
  return page.evaluate(() => {
    const date = window.Calex.selected();
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  });
}

test("week swipe moves one week with drag-glide motion", async ({ page }) => {
  await seedEvents(page, []);
  await page.goto("/");
  await page.evaluate(() => window.Calex.setView("week"));
  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-view-settling/);

  const originalDate = await selectedDateKey(page);
  const expectedNext = await page.evaluate(() => {
    const date = window.Calex.selected();
    date.setDate(date.getDate() + 7);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  });

  const draggedTransform = await swipeCalendar(page, "left");
  expect(draggedTransform).not.toBe("none");
  await expect.poll(() => selectedDateKey(page)).toBe(expectedNext);
  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-calendar-swiping/);

  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-view-settling/);
  const returnTransform = await swipeCalendar(page, "right");
  expect(returnTransform).not.toBe("none");
  await expect.poll(() => selectedDateKey(page)).toBe(originalDate);
});

test("month swipe advances one month and clamps the selected day", async ({ page }) => {
  await seedEvents(page, []);
  await page.goto("/");
  await page.evaluate(() => {
    const base = new Date();
    base.setDate(1);
    let target = null;
    for (let offset = 0; offset < 12; offset += 1) {
      const year = base.getFullYear();
      const month = base.getMonth() + offset;
      const monthEnd = new Date(year, month + 1, 0, 12);
      const nextMonthEnd = new Date(year, month + 2, 0, 12);
      if (monthEnd.getDate() > nextMonthEnd.getDate()) {
        target = monthEnd;
        break;
      }
    }
    if (!target) throw new Error("Could not find a month-end clamp fixture.");
    const key = [
      target.getFullYear(),
      String(target.getMonth() + 1).padStart(2, "0"),
      String(target.getDate()).padStart(2, "0"),
    ].join("-");
    window.Calex.selectDate(key);
    window.Calex.setView("month");
  });
  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-view-settling/);

  const before = await page.evaluate(() => {
    const date = window.Calex.selected();
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    };
  });
  const expectedNext = await page.evaluate(() => {
    const date = window.Calex.selected();
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1, 12);
    const lastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0,
    ).getDate();
    return [
      next.getFullYear(),
      String(next.getMonth() + 1).padStart(2, "0"),
      String(Math.min(date.getDate(), lastDay)).padStart(2, "0"),
    ].join("-");
  });

  const draggedTransform = await swipeCalendar(page, "left");
  expect(draggedTransform).not.toBe("none");
  await expect.poll(() => selectedDateKey(page)).toBe(expectedNext);
  const expectedTitle = new Date(
    before.year,
    before.month + 1,
    1,
  ).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  await expect(page.locator("#monthTitle")).toContainText(expectedTitle);
  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-calendar-swiping/);

  const expectedPrevious = await page.evaluate(() => {
    const date = window.Calex.selected();
    const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1, 12);
    const lastDay = new Date(
      previous.getFullYear(),
      previous.getMonth() + 1,
      0,
    ).getDate();
    const selected = new Date(
      previous.getFullYear(),
      previous.getMonth(),
      Math.min(date.getDate(), lastDay),
      12,
    );
    return [
      selected.getFullYear(),
      String(selected.getMonth() + 1).padStart(2, "0"),
      String(selected.getDate()).padStart(2, "0"),
    ].join("-");
  });
  const backTransform = await swipeCalendar(page, "right");
  expect(backTransform).not.toBe("none");
  await expect.poll(() => selectedDateKey(page)).toBe(expectedPrevious);
  const previousTitle = new Date(
    before.year,
    before.month,
    1,
  ).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  await expect(page.locator("#monthTitle")).toContainText(previousTitle);
});



test("touch swipes navigate week view on mobile-style events", async ({ page }) => {
  await seedEvents(page, []);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.Calex.setView("week"));
  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-view-settling/);

  const expectedNext = await page.evaluate(() => {
    const date = window.Calex.selected();
    date.setDate(date.getDate() + 7);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  });

  await page.locator("#selectedPanel").evaluate((surface) => {
    const touch = (identifier, clientX, clientY) => ({
      identifier,
      clientX,
      clientY,
      pageX: clientX,
      pageY: clientY,
      screenX: clientX,
      screenY: clientY,
      target: surface,
    });
    const dispatch = (type, touches, changedTouches) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, "touches", { value: touches });
      Object.defineProperty(event, "changedTouches", { value: changedTouches });
      surface.dispatchEvent(event);
    };
    dispatch("touchstart", [touch(1, 320, 100)], [touch(1, 320, 100)]);
    dispatch("touchmove", [touch(1, 210, 101)], [touch(1, 210, 101)]);
    dispatch("touchend", [], [touch(1, 210, 101)]);
  });

  await expect.poll(() => selectedDateKey(page)).toBe(expectedNext);
  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-calendar-swiping/);
});

test("horizontal trackpad gestures also advance the current period", async ({ page }) => {
  await seedEvents(page, []);
  await page.goto("/");
  await page.evaluate(() => window.Calex.setView("week"));
  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-view-settling/);

  const expectedNext = await page.evaluate(() => {
    const date = window.Calex.selected();
    date.setDate(date.getDate() + 7);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  });

  await page.locator("#calendarScroller").hover();
  await page.mouse.wheel(-120, 0);
  await expect.poll(() => selectedDateKey(page)).toBe(expectedNext);
  await expect(page.locator("#calendarScreen")).not.toHaveClass(/is-calendar-swiping/);
});

test("asset and service-worker cache versions stay in sync", async ({ page }) => {
  await page.goto("/");
  const assets = await page
    .locator('link[rel="stylesheet"][href*="?v="], script[src*="?v="]')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const value = element.getAttribute("href") || element.getAttribute("src");
        const [path, query] = value.split("?");
        return { path: path.replace(/^\.\//, ""), version: new URLSearchParams(query).get("v") };
      }),
    );
  expect(assets.length).toBeGreaterThan(0);
  const versions = [...new Set(assets.map((asset) => asset.version))];
  expect(versions).toHaveLength(1);

  const response = await page.request.get("/sw.js");
  expect(response.ok()).toBeTruthy();
  const serviceWorker = await response.text();
  const cacheVersion = serviceWorker.match(/const CACHE_NAME = "calex-shell-v(\d+)"/)?.[1];
  expect(cacheVersion).toBe(versions[0]);
  for (const asset of assets) {
    expect(serviceWorker).toContain(`./${asset.path}?v=${asset.version}`);
  }
});


test("checked checkbox tick stays inside its square", async ({ page }) => {
  await seedEvents(page, [0]);
  await page.goto("/");
  await page.locator("#todayEvents .event > input.check").first().check();

  const tick = await page
    .locator("#todayEvents .event > input.check")
    .first()
    .evaluate((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element, "::after");
      return {
        content: style.content,
        width: parseFloat(style.width),
        height: parseFloat(style.height),
        borderRightWidth: parseFloat(style.borderRightWidth),
        borderBottomWidth: parseFloat(style.borderBottomWidth),
        transform: style.transform,
        boxWidth: box.width,
        boxHeight: box.height,
        lineHeight: style.lineHeight,
      };
    });

  expect(tick.content).toBe('""');
  expect(tick.width).toBeLessThan(tick.boxWidth - 2);
  expect(tick.height).toBeLessThan(tick.boxHeight - 2);
  expect(tick.borderRightWidth).toBe(2);
  expect(tick.borderBottomWidth).toBe(2);
  expect(tick.transform).toContain("matrix");
});
