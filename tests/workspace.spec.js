const { test, expect } = require("@playwright/test");

test("desktop top bar is slimmer and left sidebar is wider", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");

  const desktop = await page.evaluate(() => ({
    topbarHeight: document.querySelector(".topbar").getBoundingClientRect().height,
    sidebarWidth: document.querySelector(".bottom-nav").getBoundingClientRect().width,
    gridColumns: getComputedStyle(document.querySelector(".app")).gridTemplateColumns,
  }));
  expect(desktop.topbarHeight).toBe(92);
  expect(desktop.sidebarWidth).toBe(260);
  expect(desktop.gridColumns.startsWith("260px")).toBeTruthy();

  await page.setViewportSize({ width: 1100, height: 900 });
  const mediumDesktop = await page.evaluate(() => ({
    topbarHeight: document.querySelector(".topbar").getBoundingClientRect().height,
    sidebarWidth: document.querySelector(".bottom-nav").getBoundingClientRect().width,
    gridColumns: getComputedStyle(document.querySelector(".app")).gridTemplateColumns,
  }));
  expect(mediumDesktop.topbarHeight).toBe(92);
  expect(mediumDesktop.sidebarWidth).toBe(224);
  expect(mediumDesktop.gridColumns.startsWith("224px")).toBeTruthy();
});

test("mobile top bar remains compact with bottom navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const layout = await page.evaluate(() => ({
    topbarHeight: document.querySelector(".topbar").getBoundingClientRect().height,
    sidebarPosition: getComputedStyle(document.querySelector(".bottom-nav")).position,
  }));
  expect(layout.topbarHeight).toBe(78);
  expect(layout.sidebarPosition).toBe("absolute");
});

const isoToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
async function addEvent(
  page,
  title,
  category = "personal",
  start = "09:00",
  end = "10:00",
) {
  await page.locator("#globalAdd").click();
  await page.locator("#eventTitle").fill(title);
  await page.locator("#eventDate").fill(isoToday());
  await page.locator("#eventStart").fill(start);
  await page.locator("#eventEnd").fill(end);
  await page.locator("#eventCategory").selectOption(category);
  await page.locator('#eventForm button[type="submit"]').click();
  await expect(page.locator("#modalBackdrop")).not.toHaveClass(/open/);
}


test("language setting translates the interface and persists the choice", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-screen="settings"]').click();
  await page.locator("#languageToggle").click();
  await expect(page.locator("#languageDetail")).toBeVisible();
  await page.locator("#languageSelect").selectOption("es");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  expect(
    await page.evaluate(() => window.CalexI18n.translate("Settings", "es")),
  ).toBe("Ajustes");
  await expect(page.locator(".settings-title")).toHaveText("Ajustes");
  await expect(page.locator('[data-screen="calendar"]')).toContainText("Calendario");
  await expect(page.locator("#languageSummary")).toHaveText("Español");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator(".settings-title")).toHaveText("Ajustes");
  await page.locator('[data-screen="settings"]').click();
  await page.locator("#languageToggle").click();
  await expect(page.locator("#languageSelect")).toHaveValue("es");

  await page.locator("#languageSelect").selectOption("fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator(".settings-title")).toHaveText("Paramètres");
  await expect(page.locator("#languageSummary")).toHaveText("Français");

  await page.locator("#languageSelect").selectOption("de");
  await expect(page.locator(".settings-title")).toHaveText("Einstellungen");
  await expect(page.locator("#preferencesSectionTitle")).toHaveText("Einstellungen");

  await page.locator("#languageSelect").selectOption("en");
  await expect(page.locator(".settings-title")).toHaveText("Settings");
  await expect(page.locator("#preferencesSectionTitle")).toHaveText("Preferences");
});

test("language switching leaves event titles unchanged", async ({ page }) => {
  await page.goto("/");
  await page.locator("#globalAdd").click();
  await page.locator("#eventTitle").fill("Dentist");
  await page.locator("#eventDate").fill("2026-10-12");
  await page.locator('#eventForm button[type="submit"]').click();
  await page.locator('[data-screen="calendar"]').click();
  await expect(page.locator("#panelEvents")).toContainText("Dentist");

  await page.locator('[data-screen="settings"]').click();
  await page.locator("#languageToggle").click();
  await page.locator("#languageSelect").selectOption("es");
  await page.locator('[data-screen="calendar"]').click();
  await expect(page.locator("#panelEvents")).toContainText("Dentist");
});

test("categorized events persist and appear in month, week, and agenda", async ({
  page,
}) => {
  await page.goto("/");
  await addEvent(page, "Project review", "work");
  await expect(page.locator(".date-cell.today:not(.outside)")).toContainText(
    "Project review",
  );
  await page.keyboard.press("w");
  await expect(page.locator("#weekTimeline")).toBeHidden();
  await expect(page.locator("#dateGrid .date-cell")).toHaveCount(7);
  await expect(page.locator("#panelEvents")).toContainText("Project review");
  await page.locator("#panelEvents .edit-btn").click();
  await expect(page.locator("#eventTitle")).toHaveValue("Project review");
  await page.locator("#closeModal").click();
  await page.locator('[data-screen="agenda"]').click();
  await expect(page.locator("#agendaList")).toContainText("Project review");
  await page.reload();
  await page.locator('[data-screen="calendar"]').click();
  await expect(page.locator(".date-cell.today:not(.outside)")).toContainText(
    "Project review",
  );
  await page.locator('.sidebar-tools [data-category="work"]').uncheck();
  await expect(
    page.locator(".date-cell.today:not(.outside)"),
  ).not.toContainText("Project review");
  await page.locator('.sidebar-tools [data-category="work"]').check();
  await expect(page.locator(".date-cell.today:not(.outside)")).toContainText(
    "Project review",
  );
});

test("invalid times block saving and overlaps are explained", async ({
  page,
}) => {
  await page.goto("/");
  await addEvent(page, "Existing appointment");
  await page.locator("#globalAdd").click();
  await page.locator("#eventTitle").fill("Conflicting appointment");
  await page.locator("#eventStart").fill("09:30");
  await page.locator("#eventEnd").fill("10:30");
  await expect(page.locator("#eventFeedback")).toContainText("overlaps");
  await page.locator("#eventEnd").fill("08:00");
  await page.locator('#eventForm button[type="submit"]').click();
  await expect(page.locator("#eventFeedback")).toContainText(
    "later than start",
  );
  await expect(page.locator("#modalBackdrop")).toHaveClass(/open/);
});

test("keyboard shortcuts, focus trap, and theme cycle", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("n");
  await expect(page.locator("#eventTitle")).toBeFocused();
  await page.locator("#closeModal").focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator('#eventForm button[type="submit"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".app")).not.toHaveAttribute("inert");
  await page.keyboard.press("/");
  await expect(page.locator("#searchInput")).toBeFocused();
  await page.locator("#searchInput").fill("nothing matches this");
  await expect(page.locator("#searchResults")).toContainText("No");
  await page.locator("#themeToggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("#themeToggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

for (const width of [375, 820, 1440]) {
  test(`responsive calendar, settings, and assistant at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("#globalAdd")).toBeVisible();
    await page.locator('[data-screen="calendar"]').click();
    await expect(page.locator(".date-cell.today:not(.outside)")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.locator('[data-screen="settings"]').click();
    await expect(page.locator("#appearanceToggle")).toBeVisible();
    await page.locator("#openAssistant").click();
    await expect(page.locator("#assistantDialog")).toBeVisible();
    await expect(page.locator("#shareCalendar")).not.toBeChecked();
    await expect(page.locator("#sendAssistant")).toBeDisabled();
    await page.locator("#closeAssistant").click();
    if (width < 701) {
      await page.locator('[data-screen="calendar"]').click();
      await page.locator("#filterCalendars").click();
      await page.locator('#filtersDialog [data-category="work"]').uncheck();
      await page.locator("#closeFilters").click();
    }
  });
}

test("Puter integration reviews a draft, keeps context opt-in, and escapes text", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.aiCalls = [];
    window.puter = {
      auth: { signIn: async () => ({}) },
      ai: {
        chat: async (messages) => {
          window.aiCalls.push(messages);
          return {
            message: {
              content: JSON.stringify({
                reply:
                  "<img src=x onerror=alert(1)> Review this event before saving.",
                event: {
                  title: "AI planning session",
                  date: "2026-10-12",
                  start: "09:00",
                  end: "09:30",
                  category: "work",
                  repeat: "none",
                },
              }),
            },
          };
        },
      },
    };
  });
  await page.goto("/");
  await addEvent(page, "Private dentist", "personal");
  await page.locator("#openAssistant").click();
  await page.locator("#connectPuter").click();
  await page.locator("#assistantInput").fill("Schedule planning tomorrow");
  await page.locator("#sendAssistant").click();
  await expect(page.locator(".assistant-draft")).toContainText(
    "AI planning session",
  );
  await expect(page.locator("#assistantMessages img")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      window.aiCalls[0][0].content.includes("Private dentist"),
    ),
  ).toBeFalsy();
  await page.locator("#shareCalendar").check();
  await page.locator("#assistantInput").fill("Find focus time");
  await page.locator("#sendAssistant").click();
  await expect(page.locator(".assistant-draft")).toHaveCount(2);
  expect(
    await page.evaluate(() =>
      window.aiCalls[1][0].content.includes("Private dentist"),
    ),
  ).toBeTruthy();
  await page.locator(".assistant-draft button").last().click();
  await expect(page.locator("#eventTitle")).toHaveValue("AI planning session");
  await expect(page.locator("#eventCategory")).toHaveValue("work");
  await expect(page.locator("#panelEvents")).not.toContainText(
    "AI planning session",
  );
  await page.locator('#eventForm button[type="submit"]').click();
  await expect(page.locator("#panelEvents")).toContainText(
    "AI planning session",
  );
});

test("assistant handles provider errors without losing the prompt", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.puter = {
      auth: { signIn: async () => ({}) },
      ai: {
        chat: async () => {
          throw new Error("Usage allowance exceeded");
        },
      },
    };
  });
  await page.goto("/");
  await page.locator("#openAssistant").click();
  await page.locator("#connectPuter").click();
  await page.locator("#assistantInput").fill("Plan my day");
  await page.locator("#sendAssistant").click();
  await expect(page.locator("#assistantError")).toContainText(
    "Usage allowance",
  );
  await expect(page.locator("#assistantInput")).toHaveValue("Plan my day");
  await expect(page.locator("#sendAssistant")).toBeEnabled();
});

test("fortnightly recurrence does not appear every day or every week", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#globalAdd").click();
  await page.locator("#eventTitle").fill("Every other Monday");
  await page.locator("#eventDate").fill("2026-10-12");
  await page.locator("#eventRepeat").selectOption("fortnightly");
  await page.locator('#eventForm button[type="submit"]').click();
  await page.locator('[data-date="2026-10-19"]').click();
  await expect(page.locator("#panelEvents")).not.toContainText(
    "Every other Monday",
  );
  await page.locator('[data-date="2026-10-26"]').click();
  await expect(page.locator("#panelEvents")).toContainText(
    "Every other Monday",
  );
});

test("blocked browser storage warns clearly and the calendar remains usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#runtimeNotice")).toContainText(
    "Events last only for this session",
  );
  await addEvent(page, "Session-only event");
  await expect(page.locator("#panelEvents")).toContainText(
    "Session-only event",
  );
  expect(errors).toEqual([]);
});

test("invalid AI event dates never expose a saveable draft", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.puter = {
      auth: { signIn: async () => ({}) },
      ai: {
        chat: async () => ({
          message: {
            content:
              '{"reply":"A suggestion","event":{"title":"Impossible","date":"2026-02-31","start":"09:00","end":"08:00"}}',
          },
        }),
      },
    };
  });
  await page.goto("/");
  await page.locator("#openAssistant").click();
  await page.locator("#connectPuter").click();
  await page.locator("#assistantInput").fill("Schedule something");
  await page.locator("#sendAssistant").click();
  await expect(page.locator("#assistantError")).toContainText(
    "invalid details",
  );
  await expect(page.locator(".assistant-draft")).toHaveCount(0);
});
