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
  await page.locator('#languageResults [data-language="es"]').click();

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
  await expect(page.locator('#languageResults [data-language="es"]')).toHaveAttribute("aria-selected", "true");

  await page.locator('#languageResults [data-language="fr"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator(".settings-title")).toHaveText("Paramètres");
  await expect(page.locator("#languageSummary")).toHaveText("Français");

  await page.locator('#languageResults [data-language="de"]').click();
  await expect(page.locator(".settings-title")).toHaveText("Einstellungen");
  await expect(page.locator("#preferencesSectionTitle")).toHaveText("Einstellungen");

  await page.locator('#languageResults [data-language="en"]').click();
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
  await page.locator('#languageResults [data-language="es"]').click();
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

test("language picker supports Auto and East Asian languages without a native select", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-screen="settings"]').click();
  await page.locator("#languageToggle").click();
  await expect(page.locator("#languageSelect")).toHaveCount(0);
  for (const code of ["auto", "zh", "ja", "ko"]) {
    await expect(page.locator(`#languageResults [data-language="${code}"]`)).toBeVisible();
  }
  await page.locator("#languageSearch").fill("한국어");
  await expect(page.locator('#languageResults [data-language="ko"]')).toBeVisible();
  await expect(page.locator('#languageResults [data-language="zh"]')).toHaveCount(0);
  await page.locator('#languageResults [data-language="ko"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.locator(".settings-title")).toHaveText("설정");
  await expect(page.locator("#languageSummary")).toHaveText("한국어");
  await expect(page.locator("#languageHelp")).toHaveText(
    "언어를 선택하거나 ‘자동’을 사용해 기기의 시스템 언어를 따르세요.",
  );
  await expect(page.locator("#languageResults [data-language='en']")).toBeVisible();

  await page.locator("#languageSearch").fill("中文");
  await page.locator('#languageResults [data-language="zh"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.locator(".settings-title")).toHaveText("设置");
  await expect(page.locator("#languageHelp")).toHaveText(
    "选择一种语言，或选择“自动”以跟随设备的系统语言。",
  );
  expect(await page.evaluate(() => window.CalexI18n.translate("Repeats every 2 weeks", "zh"))).toBe("每2周重复");

  await page.locator("#languageSearch").fill("日本語");
  await page.locator('#languageResults [data-language="ja"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator(".settings-title")).toHaveText("設定");
  await expect(page.locator("#languageHelp")).toHaveText(
    "言語を選択するか、「自動」を選んでデバイスのシステム言語に従ってください。",
  );
  expect(await page.evaluate(() => window.CalexI18n.translate("Repeats every 2 weeks", "ja"))).toBe("毎2週間繰り返し");
});

test("Auto language follows the device system language", async ({ page }) => {
  await page.goto("/");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "languages", { configurable: true, get: () => ["ja-JP"] });
    Object.defineProperty(navigator, "language", { configurable: true, get: () => "ja-JP" });
    localStorage.setItem("calex-language-v1", "auto");
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator(".settings-title")).toHaveText("設定");
});

test("Chinese, Japanese, and Korean cover every bundled phrase", async ({ page }) => {
  await page.goto("/");

  const audit = await page.evaluate(() => ({
    zh: window.CalexI18n.missingTranslations("zh"),
    ja: window.CalexI18n.missingTranslations("ja"),
    ko: window.CalexI18n.missingTranslations("ko"),
    more: {
      zh: window.CalexI18n.translate("3 more", "zh"),
      ja: window.CalexI18n.translate("3 more", "ja"),
      ko: window.CalexI18n.translate("3 more", "ko"),
    },
    policy: {
      zh: window.CalexI18n.translate("Privacy policy", "zh"),
      ja: window.CalexI18n.translate("Privacy policy", "ja"),
      ko: window.CalexI18n.translate("Privacy policy", "ko"),
    },
    placeholders: {
      zh: window.CalexI18n.translate("At least 6 characters", "zh"),
      ja: window.CalexI18n.translate("At least 6 characters", "ja"),
      ko: window.CalexI18n.translate("At least 6 characters", "ko"),
    },
    runtime: {
      zh: window.CalexI18n.translate("That file is too large to import (5 MB max).", "zh"),
      ja: window.CalexI18n.translate("That file is too large to import (5 MB max).", "ja"),
      ko: window.CalexI18n.translate("That file is too large to import (5 MB max).", "ko"),
    },
  }));

  expect(audit.zh).toEqual([]);
  expect(audit.ja).toEqual([]);
  expect(audit.ko).toEqual([]);
  expect(audit.more).toEqual({
    zh: "+3 更多",
    ja: "ほか3件",
    ko: "외 3개",
  });
  expect(audit.policy).toEqual({
    zh: "隐私政策",
    ja: "プライバシーポリシー",
    ko: "개인정보 처리방침",
  });
  expect(audit.placeholders).toEqual({
    zh: "至少 6 个字符",
    ja: "6文字以上",
    ko: "6자 이상",
  });
  expect(audit.runtime).toEqual({
    zh: "文件过大，无法导入（最大 5 MB）。",
    ja: "ファイルが大きすぎるためインポートできません（最大5 MB）。",
    ko: "파일이 너무 커서 가져올 수 없습니다(최대 5MB).",
  });
});

const eastAsianLanguages = [
    {
      code: "zh",
      workspace: "工作区",
      assistantPrompt: "规划小帮手",
      assistantSubtitle: "认识 Calex 助手",
      footer: "为日常生活而设计",
      homeTitle: "留一点喘息空间。",
      homeBody: "你可以安排属于自己的一天。添加一件值得为之留出时间的事吧。",
      homeButton: "添加你的第一个日程",
      agendaTitle: "下一篇章尚待书写。",
      agendaBody: "添加一个日程，开始规划接下来的日子。",
      accountTitle: "登录或创建账户",
      accountSubtitle: "在不同设备间安全地同步日历",
      syncNote: "登录之前，你的日程会保存在此设备上。",
      accountDescription: "让你在不同设备上都能使用日历和偏好设置。",
      quickHint: "开始输入以查看预览…",
      quickExample: "试试输入",
      quickPrefix: "基于规则的预览",
      repeat: "每周重复",
      eventName: "日程名称",
      never: "从不",
      descriptionPlaceholder: "简短描述…",
      descriptionLabel: "日程描述",
      locationLabel: "位置",
      locationPlaceholder: "添加地点",
      startTimeLabel: "开始时间",
      endTimeLabel: "结束时间",
      repeatLabel: "重复",
      peopleLabel: "人员",
      categoryLabel: "日历",
      personalCategory: "个人",
      workCategory: "工作与学习",
      wellbeingCategory: "身心健康",
      notesLabel: "备注",
      notesPlaceholder: "其他需要记住的事项",
      saveEvent: "保存事件",
      timezoneRegion: "亚洲",
      using: "正在使用",
      saveTimezone: "保存以应用更改。",
    },
    {
      code: "ja",
      workspace: "ワークスペース",
      assistantPrompt: "計画を少しお手伝い",
      assistantSubtitle: "Calex アシスタントの紹介",
      footer: "毎日のために",
      homeTitle: "少しゆとりを。",
      homeBody: "一日の過ごし方はあなた次第です。時間をかけたいことを追加しましょう。",
      homeButton: "最初の予定を追加",
      agendaTitle: "次の章はまだ白紙です。",
      agendaBody: "予定を追加して、これからの日々を形にしましょう。",
      accountTitle: "サインインまたはアカウントを作成",
      accountSubtitle: "デバイス間でカレンダーを安全に同期",
      syncNote: "サインインするまで、予定はこのデバイスに保存されます。",
      accountDescription: "複数のデバイスでカレンダーと設定を利用できるようにします。",
      quickHint: "入力するとプレビューが表示されます…",
      quickExample: "などを試してください",
      quickPrefix: "ルールベースのプレビュー",
      repeat: "毎週繰り返し",
      eventName: "予定名",
      never: "なし",
      descriptionPlaceholder: "短い説明…",
      descriptionLabel: "予定の説明",
      locationLabel: "場所",
      locationPlaceholder: "場所を追加",
      startTimeLabel: "開始時刻",
      endTimeLabel: "終了時刻",
      repeatLabel: "繰り返し",
      peopleLabel: "参加者",
      categoryLabel: "カレンダー",
      personalCategory: "個人",
      workCategory: "仕事と学習",
      wellbeingCategory: "ウェルビーイング",
      notesLabel: "メモ",
      notesPlaceholder: "ほかに覚えておくこと",
      saveEvent: "予定を保存",
      timezoneRegion: "アジア",
      using: "使用中",
      saveTimezone: "適用するには保存してください。",
    },
    {
      code: "ko",
      workspace: "워크스페이스",
      assistantPrompt: "계획 도우미",
      assistantSubtitle: "Calex 어시스턴트 만나기",
      footer: "일상을 위해 만들었습니다",
      homeTitle: "조금의 여유.",
      homeBody: "하루는 스스로 만들어 가세요. 시간을 쓸 가치가 있는 일을 추가하세요.",
      homeButton: "첫 일정 추가",
      agendaTitle: "다음 장은 아직 쓰이지 않았습니다.",
      agendaBody: "일정을 추가해 앞으로의 날들을 계획해 보세요.",
      accountTitle: "로그인 또는 계정 만들기",
      accountSubtitle: "여러 기기에서 캘린더를 안전하게 동기화",
      syncNote: "로그인할 때까지 일정은 이 기기에 저장됩니다.",
      accountDescription: "여러 기기에서 캘린더와 환경설정을 사용할 수 있습니다.",
      quickHint: "입력을 시작하면 미리보기가 표시됩니다…",
      quickExample: "등을 입력해 보세요",
      quickPrefix: "규칙 기반 미리보기",
      repeat: "매주 반복",
      eventName: "일정 이름",
      never: "안 함",
      descriptionPlaceholder: "간단한 설명…",
      descriptionLabel: "일정 설명",
      locationLabel: "위치",
      locationPlaceholder: "장소 추가",
      startTimeLabel: "시작 시간",
      endTimeLabel: "종료 시간",
      repeatLabel: "반복",
      peopleLabel: "참여자",
      categoryLabel: "캘린더",
      personalCategory: "개인",
      workCategory: "업무 및 학습",
      wellbeingCategory: "웰빙",
      notesLabel: "메모",
      notesPlaceholder: "기억할 다른 사항",
      saveEvent: "일정 저장",
      timezoneRegion: "아시아",
      using: "사용 중",
      saveTimezone: "적용하려면 저장하세요.",
    },
  ];

for (const lang of eastAsianLanguages) {
  test(`${lang.code} translates sidebar, empty states, event forms, previews, and time zones`, async ({ page }) => {
    page.setDefaultTimeout(5000);
    await page.goto("/");
    await page.locator('[data-screen="settings"]').click();
    await page.locator("#languageToggle").click();
    await page.locator(`#languageResults [data-language="${lang.code}"]`).click();
    await page.locator("#languageToggle").click();

    await expect(page.locator(".sidebar-caption").first()).toHaveText(lang.workspace);
    await expect(page.locator("#sidebarAssistant > span > span")).toHaveText(lang.assistantSubtitle);
    const assistantPrompt = await page.locator("#sidebarAssistant > span").evaluate((el) =>
      Array.from(el.childNodes).find((node) => node.nodeType === 3 && node.textContent.trim())?.textContent.trim(),
    );
    expect(assistantPrompt).toBe(lang.assistantPrompt);
    const footerText = await page.locator(".sidebar-footer > span").nth(1).evaluate((el) =>
      Array.from(el.childNodes).find((node) => node.nodeType === 3 && node.textContent.trim())?.textContent.trim(),
    );
    expect(footerText).toBe(lang.footer);

    await page.locator('[data-screen="home"]').click();
    await expect(page.locator("#todayEvents .empty h3")).toHaveText(lang.homeTitle);
    await expect(page.locator("#todayEvents .empty p")).toHaveText(lang.homeBody);
    await expect(page.locator("#todayEvents .empty button")).toHaveText(lang.homeButton);

    await page.locator("#homeQuickAdd").click();
    await expect(page.locator("#quickText")).toHaveAttribute("placeholder", lang.code === "zh"
      ? "例如：明天 10:07 至 11:00 牙医，每周重复"
      : lang.code === "ja"
        ? "例：明日10:07〜11:00 歯科、毎週繰り返し"
        : "예: 내일 10:07~11:00 치과, 매주 반복",
    );
    await expect(page.locator("#quickForm .nlp-help").first()).toContainText(lang.quickExample);
    await expect(page.locator("#quickPreview")).toHaveText(lang.quickHint);
    await page.locator("#quickText").fill("Team meeting tomorrow every week");
    await expect(page.locator("#quickPreview")).toContainText(lang.quickPrefix);
    await expect(page.locator("#quickPreview")).toContainText(lang.repeat);
    await expect(page.locator("#quickPreview")).toContainText("Team meeting");
    await page.locator("#closeModal").click();

    await page.locator('[data-screen="calendar"]').click();
    await expect(page.locator("#workspaceTitle")).toHaveText(
      lang.code === "zh"
        ? "为每件事留出一点空间"
        : lang.code === "ja"
          ? "すべてに少しずつ余裕を"
          : "모든 일을 위한 작은 여유",
    );
    await expect(page.locator("#viewHandle")).toHaveAttribute(
      "aria-label",
      new RegExp(lang.code === "zh" ? "拖动" : lang.code === "ja" ? "ドラッグ" : "드래그"),
    );
    await page.locator("#globalAdd").click();
    await expect(page.locator("#modalTitle")).toHaveText(
      lang.code === "zh" ? "新建事件" : lang.code === "ja" ? "新しい予定" : "새 일정",
    );
    await expect(page.locator("#eventTitle")).toHaveAttribute("placeholder", lang.eventName);
    await expect(page.locator('#eventRepeat option[value="none"]')).toHaveText(lang.never);
    await expect(page.locator("#eventForm label[for='eventDate']")).toHaveText(
      lang.code === "zh" ? "日期 *" : lang.code === "ja" ? "日付 *" : "날짜 *",
    );
    await expect(page.locator("#eventDescription")).toHaveAttribute("placeholder", lang.descriptionPlaceholder);
    await expect(page.locator("#eventDescription")).toHaveAttribute("aria-label", lang.descriptionLabel);
    await expect(page.locator("#eventForm label[for='eventLocation']")).toHaveText(lang.locationLabel);
    await expect(page.locator("#eventLocation")).toHaveAttribute("placeholder", lang.locationPlaceholder);
    await expect(page.locator("#eventForm label[for='eventStart']")).toHaveText(lang.startTimeLabel);
    await expect(page.locator("#eventForm label[for='eventEnd']")).toHaveText(lang.endTimeLabel);
    await expect(page.locator("#eventForm label[for='eventRepeat']")).toHaveText(lang.repeatLabel);
    await expect(page.locator("#eventForm label[for='eventPeople']")).toHaveText(lang.peopleLabel);
    await expect(page.locator("#eventForm label[for='eventCategory']")).toHaveText(lang.categoryLabel);
    await expect(page.locator('#eventCategory option[value="personal"]')).toHaveText(lang.personalCategory);
    await expect(page.locator('#eventCategory option[value="work"]')).toHaveText(lang.workCategory);
    await expect(page.locator('#eventCategory option[value="wellbeing"]')).toHaveText(lang.wellbeingCategory);
    await expect(page.locator("#eventForm label[for='eventNotes']")).toHaveText(lang.notesLabel);
    await expect(page.locator("#eventNotes")).toHaveAttribute("placeholder", lang.notesPlaceholder);
    await expect(page.locator('#eventForm button[type="submit"]')).toHaveText(lang.saveEvent);
    await page.locator("#closeModal").click();

    await page.locator('[data-screen="agenda"]').click();
    await expect(page.locator(".agenda-empty h3")).toHaveText(lang.agendaTitle);
    await expect(page.locator(".agenda-empty p")).toHaveText(lang.agendaBody);

    await page.locator('[data-screen="settings"]').click();
    await expect(page.locator(".settings-row-title[data-i18n='Import calendar']")).toHaveText(
      lang.code === "zh" ? "导入日历" : lang.code === "ja" ? "カレンダーをインポート" : "캘린더 가져오기",
    );
    await expect(page.locator(".settings-row-sub[data-i18n*='.ics file']")).toHaveText(
      lang.code === "zh"
        ? "从 .ics 文件添加日程（Google、Outlook、Apple）"
        : lang.code === "ja"
          ? ".ics ファイル（Google、Outlook、Apple）から予定を追加"
          : ".ics 파일(Google, Outlook, Apple)에서 일정 추가",
    );
    await expect(page.locator(".settings-section-description")).toHaveText(lang.accountDescription);
    await expect(page.locator("#settingsSignInTitle")).toHaveText(lang.accountTitle);
    await expect(page.locator("#settingsSignInSubtitle")).toHaveText(lang.accountSubtitle);
    await expect(page.locator("#settingsSyncNote")).toHaveText(lang.syncNote);

    await page.locator("#timezoneToggle").click();
    await page.locator("#timezoneAuto").click();
    await expect(page.locator("#timezoneHelp")).toContainText(lang.using);
    await page.locator("#timezoneManual").click();
    await page.locator("#timezoneSearch").fill("Asia/Tokyo");
    await expect(page.locator("#timezoneResults .timezone-result")).toHaveCount(1);
    await expect(page.locator("#timezoneResults .timezone-result-region")).toHaveText(lang.timezoneRegion);
    await page.locator("#timezoneResults .timezone-result").click();
    await expect(page.locator("#timezoneHelp")).toContainText(lang.saveTimezone);
    await page.locator("#timezoneSearch").fill("no-such-time-zone");
    await expect(page.locator("#timezoneResults .timezone-no-results")).toContainText(
      lang.code === "zh"
        ? "没有匹配的时区。请尝试城市或地区名称。"
        : lang.code === "ja"
          ? "一致するタイムゾーンがありません。都市名や地域名をお試しください。"
          : "일치하는 시간대가 없습니다. 도시 또는 지역 이름을 입력하세요.",
    );
  });
}

test("Quick Add preview labels update with language changes while keeping event text intact", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.CalexI18n.setLanguage("zh"));
  await page.locator("#homeQuickAdd").click();
  await page.locator("#quickText").fill("Team meeting tomorrow every week");

  await expect(page.locator("#quickPreview")).toContainText("基于规则的预览");
  await expect(page.locator("#quickPreview")).toContainText("每周重复");
  await expect(page.locator("#quickPreview")).toContainText("Team meeting");

  await page.evaluate(() => window.CalexI18n.setLanguage("ja"));
  await expect(page.locator("#quickPreview")).toContainText("ルールベースのプレビュー");
  await expect(page.locator("#quickPreview")).toContainText("毎週繰り返し");
  await expect(page.locator("#quickPreview")).toContainText("Team meeting");

  await page.locator("#quickText").fill("");
  await expect(page.locator("#quickPreview")).toHaveText("入力するとプレビューが表示されます…");
});

test("Gmail panel explains setup and does not request mailbox access until configured", async ({ page }) => {
  await page.route("**/gmail-config.js*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: 'window.CALEX_GMAIL_CLIENT_ID = "";',
    });
  });

  await page.goto("/");
  await page.locator("#openGmail").click();

  await expect(page.locator("#gmailDialog")).toBeVisible();
  await expect(page.locator("#gmailSetupHelp")).toBeVisible();
  await expect(page.locator("#gmailConnect")).toBeDisabled();
  await expect(page.locator(".gmail-privacy-note")).toContainText(
    "its text is sent to Puter AI",
  );
  await expect(page.locator("#gmailStatus")).toContainText(
    "not configured",
  );
});

test("Gmail connects with read-only OAuth and displays inbox cards that can be dragged", async ({ page }) => {
  await page.addInitScript(() => {
    window.CALEX_GMAIL_CLIENT_ID = "calex-test-client.apps.googleusercontent.com";
  });
  await page.route("https://accounts.google.com/gsi/client", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.google={accounts:{oauth2:{initTokenClient:function(c){window.__requestedGmailScope=c.scope;return {requestAccessToken:function(){c.callback({access_token:'test-access-token',expires_in:3600});}};},revoke:function(t,cb){if(cb)cb();}}}};",
    }),
  );
  await page.route("https://gmail.googleapis.com/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/messages?")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          messages: [{ id: "mail-planning-1", threadId: "thread-planning-1" }],
        }),
      });
      return;
    }
    if (url.includes("/messages/mail-planning-1?") && url.includes("format=metadata")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "mail-planning-1",
          threadId: "thread-planning-1",
          internalDate: "1793601000000",
          snippet: "Let's meet to plan the project timeline.",
          payload: {
            mimeType: "text/plain",
            headers: [
              { name: "From", value: "Sam Example <sam@example.com>" },
              { name: "Subject", value: "Planning session" },
              { name: "Date", value: "Mon, 2 Nov 2026 09:30:00 +0000" },
            ],
          },
        }),
      });
      return;
    }
    await route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
  });

  await page.goto("/");
  await page.locator("#openGmail").click();
  await expect(page.locator("#gmailSetupHelp")).toBeHidden();
  await page.locator("#gmailConnect").click();
  expect(await page.evaluate(() => window.__requestedGmailScope)).toBe(
    "https://www.googleapis.com/auth/gmail.readonly",
  );

  const email = page.locator(".gmail-email").filter({ hasText: "Planning session" });
  await expect(email).toBeVisible();
  await expect(email).toContainText("sam@example.com");
  await expect(email).toContainText("Let's meet to plan the project timeline.");
  await expect(email).toHaveAttribute("draggable", "true");
  await expect(page.locator("#gmailStatus")).toContainText("Showing 1 recent message");

  const dropTarget = await page.evaluate(() => {
    const cell = document.querySelector("#dateGrid .date-cell[data-date]");
    const transfer = new DataTransfer();
    transfer.setData("application/x-calex-gmail-message", "mail-planning-1");
    const event = new DragEvent("dragover", {
      bubbles: true,
      cancelable: true,
      dataTransfer: transfer,
    });
    cell.dispatchEvent(event);
    return {
      highlighted: cell.classList.contains("gmail-drop-target"),
      prevented: event.defaultPrevented,
    };
  });
  expect(dropTarget.highlighted).toBeTruthy();
  expect(dropTarget.prevented).toBeTruthy();

  await page.evaluate(() => window.CalexI18n.setLanguage("zh"));
  await expect(page.locator(".gmail-email-subject")).toHaveText("Planning session");
  await expect(page.locator(".gmail-email-snippet")).toHaveText(
    "Let's meet to plan the project timeline.",
  );
});

test("Puter converts email content into a validated event draft without saving it", async ({ page }) => {
  await page.addInitScript(() => {
    window.puter = {
      auth: { signIn: async () => true },
      ai: {
        chat: async (messages) => {
          window.__emailExtractionPrompt = messages;
          return JSON.stringify({
            reply: "Planning session found.",
            event: {
              title: "Planning session with Sam",
              date: null,
              start: "09:30",
              end: "10:15",
              location: "Online",
              category: "work",
              repeat: "none",
              description: "Discuss the project timeline.",
              people: "Sam",
              notes: "Bring the project draft.",
            },
          });
        },
      },
    };
  });
  await page.goto("/");
  await page.locator("#openAssistant").click();
  await page.locator("#connectPuter").click();
  await expect(page.locator("#puterConnection")).toBeHidden();
  await page.locator("#closeAssistant").click();

  const result = await page.evaluate(async () => {
    const result = await window.CalexPuter.convertEmailToEvent({
      from: "Sam Example <sam@example.com>",
      subject: "Planning session",
      date: "Mon, 2 Nov 2026 09:30:00 +0000",
      snippet: "Let's meet to plan the project timeline.",
      body: "The project planning session will cover milestones.",
      preferredDate: "2026-11-03",
    });
    window.__emailDraft = result.event;
    return {
      event: result.event,
      system: window.__emailExtractionPrompt[0].content,
      prompt: JSON.parse(window.__emailExtractionPrompt[1].content),
    };
  });

  expect(result.event.date).toBe("2026-11-03");
  expect(result.event.title).toBe("Planning session with Sam");
  expect(result.event.location).toBe("Online");
  expect(result.system).toContain("untrusted data");
  expect(result.prompt.preferredDate).toBe("2026-11-03");

  await page.evaluate(() => window.Calex.draftEvent(window.__emailDraft));
  await expect(page.locator("#eventTitle")).toHaveValue("Planning session with Sam");
  await expect(page.locator("#eventDate")).toHaveValue("2026-11-03");
  await expect(page.locator("#eventDescription")).toHaveValue("Discuss the project timeline.");
  await expect(page.locator("#eventPeople")).toHaveValue("Sam");
  await expect(page.locator("#eventNotes")).toHaveValue("Bring the project draft.");
  await expect(page.locator('#eventForm button[type="submit"]')).toBeVisible();
});

