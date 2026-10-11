const { test, expect } = require("@playwright/test");

async function dragView(page, dy) {
  await page.waitForFunction(
    () =>
      !document
        .querySelector("#calendarScreen")
        .classList.contains("is-view-settling"),
  );
  const box = await page.locator("#viewHandle").boundingBox();
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + dy, { steps: 12 });
  await page.mouse.up();
}

for (const [width, height] of [
  [375, 812],
  [820, 1180],
  [1440, 960],
]) {
  test(`compact calendar views and drag at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.locator('[data-screen="calendar"]').click();
    await expect(page.locator("#calendarScreen")).toHaveAttribute(
      "data-view",
      "all",
    );
    for (const id of [
      "prevYear",
      "prevMonth",
      "nextMonth",
      "nextYear",
      "viewHandle",
    ]) {
      await expect(page.locator("#" + id)).toBeVisible();
      const b = await page.locator("#" + id).boundingBox();
      expect(b.y + b.height).toBeLessThanOrEqual(height);
    }
    await dragView(page, -90);
    await expect(page.locator("#calendarScreen")).toHaveAttribute(
      "data-view",
      "month",
    );
    await expect(page.locator("#dateGrid .date-cell")).toHaveCount(42);
    await expect(page.locator("#panelAdd")).toBeVisible();
    await dragView(page, -70);
    await expect(page.locator("#calendarScreen")).toHaveAttribute(
      "data-view",
      "week",
    );
    await expect(page.locator("#dateGrid .date-cell")).toHaveCount(7);
    const rightmost = await page
      .locator("#dateGrid .date-cell")
      .last()
      .boundingBox();
    expect(rightmost.x + rightmost.width).toBeLessThanOrEqual(width);
    await dragView(page, 70);
    await expect(page.locator("#calendarScreen")).toHaveAttribute(
      "data-view",
      "month",
    );
    await dragView(page, 90);
    await expect(page.locator("#calendarScreen")).toHaveAttribute(
      "data-view",
      "all",
    );
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollHeight <= innerHeight &&
          document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  });
}

test("month and year arrows each work independently", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-screen="calendar"]').click();
  await page.keyboard.press("m");
  const original = await page.locator("#monthTitle").textContent();
  await page.locator("#nextYear").click();
  await expect(page.locator("#monthTitle")).not.toHaveText(original);
  await page.locator("#prevYear").click();
  await expect(page.locator("#monthTitle")).toHaveText(original);
  await page.locator("#nextMonth").click();
  await expect(page.locator("#monthTitle")).not.toHaveText(original);
  await page.locator("#prevMonth").click();
  await expect(page.locator("#monthTitle")).toHaveText(original);
});

test("ordinary calendar dates are unboxed and the redundant view switch is absent", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-screen="calendar"]').click();
  await expect(page.locator(".view-segment")).toHaveCount(0);
  await page.keyboard.press("m");
  const appearance = () =>
    page
      .locator("#dateGrid .date-cell:not(.selected):not(.today)")
      .evaluateAll((cells) =>
        cells.map((cell) => {
          const style = getComputedStyle(cell);
          return {
            background: style.backgroundColor,
            border: style.borderTopWidth,
            shadow: style.boxShadow,
          };
        }),
      );
  for (const cell of await appearance()) {
    expect(cell.background).toBe("rgba(0, 0, 0, 0)");
    expect(cell.border).toBe("0px");
    expect(cell.shadow).toBe("none");
  }
  await page.locator("#themeToggle").click();
  for (const cell of await appearance())
    expect(cell.background).toBe("rgba(0, 0, 0, 0)");
  await page.keyboard.press("w");
  await expect(page.locator("#dateGrid .date-cell")).toHaveCount(7);
  await page.keyboard.press("y");
  await expect(page.locator("#calendarScreen")).toHaveAttribute(
    "data-view",
    "all",
  );
});

async function authMock(
  page,
  { signupError = null, signinError = null, recovering = false } = {},
) {
  await page.route("**/supabase-js@*", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
    window.supabase={createClient:()=>({
      auth:{
        signInWithPassword:async()=>({error:${JSON.stringify(signinError)},data:{session:null}}),
        signUp:async()=>({error:${JSON.stringify(signupError)},data:{user:{id:'test-user'},session:null}}),
        resend:async()=>{window.resendCalls=(window.resendCalls||0)+1;return{error:null}},
        resetPasswordForEmail:async()=>({error:null}),
        updateUser:async()=>{window.updatedPassword=true;return{error:null}},
        signInWithOAuth:async()=>({error:null}),
        onAuthStateChange:callback=>{${recovering ? `setTimeout(()=>callback('PASSWORD_RECOVERY',{user:{id:'test-user',email:'test@example.com'}}),10);` : ""}},
        getSession:async()=>({data:{session:${recovering ? `{user:{id:'test-user',email:'test@example.com'}}` : "null"}}}),
        signOut:async()=>({error:null})
      },
      from:()=>({select:()=>({eq:async()=>({data:[],error:null})}),upsert:async()=>({error:null}),delete:()=>({eq:()=>({in:async()=>({error:null})})})})
    })};
  `,
    }),
  );
}
async function openAccount(page) {
  await page.goto("/");
  await page.locator('[data-screen="settings"]').click();
  await page.locator("#settingsSignIn").click();
}
test("Google sign-in is visible and invalid credentials explain Google-only accounts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await authMock(page, {
    signinError: {
      code: "invalid_credentials",
      message: "Invalid login credentials",
    },
  });
  await openAccount(page);
  await expect(page.locator("#authGoogle")).toBeVisible();
  const box = await page.locator("#authGoogle").boundingBox();
  expect(box.y + box.height).toBeLessThan(740);
  await page.locator("#authEmail").fill("test@example.com");
  await page.locator("#authPassword").fill("fixture-password");
  await page.locator("#authSubmit").click();
  await expect(page.locator("#authFeedback")).toContainText(
    "originally used Google",
  );
});
test("signup confirmation has inline guidance and a rate-limited resend", async ({
  page,
}) => {
  await authMock(page);
  await openAccount(page);
  await page.locator("#authEmail").fill("test@example.com");
  await page.locator("#authPassword").fill("fixture-password");
  await page.locator("#authSignup").click();
  await expect(page.locator("#authFeedback")).toContainText(
    "Signup request accepted",
  );
  await page.locator("#authResend").click();
  await expect(page.locator("#authResend")).toBeDisabled();
  expect(await page.evaluate(() => window.resendCalls)).toBe(1);
});
test("sending failures report SMTP configuration instead of claiming success", async ({
  page,
}) => {
  await authMock(page, {
    signupError: {
      status: 429,
      code: "over_email_send_rate_limit",
      message: "rate limit",
    },
  });
  await openAccount(page);
  await page.locator("#authEmail").fill("test@example.com");
  await page.locator("#authPassword").fill("fixture-password");
  await page.locator("#authSignup").click();
  await expect(page.locator("#authFeedback")).toContainText("sending limit");
});
test("password recovery displays a secure form instead of a browser prompt", async ({
  page,
}) => {
  await authMock(page, { recovering: true });
  await page.goto("/");
  await expect(page.locator("#authRecovery")).toBeVisible();
  await page.locator("#recoveryPassword").fill("fixture-new-password");
  await page.locator("#recoveryConfirm").fill("fixture-mismatch");
  await page.locator("#recoverySubmit").click();
  await expect(page.locator("#authFeedback")).toContainText("do not match");
  await page.locator("#recoveryConfirm").fill("fixture-new-password");
  await page.locator("#recoverySubmit").click();
  await expect(page.locator("#authFeedback")).toContainText("Password set");
  expect(await page.evaluate(() => window.updatedPassword)).toBeTruthy();
});
