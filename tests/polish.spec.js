const { test, expect } = require("@playwright/test");

for (const [width, height] of [
  [375, 812],
  [820, 1180],
  [1440, 960],
]) {
  test(`calendar highlights and native form alignment at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.locator('[data-screen="calendar"]').click();
    await page.keyboard.press("m");
    await expect(page.locator(".view-segment")).toHaveCount(0);
    await page
      .locator("#dateGrid .date-cell:not(.selected):not(.outside)")
      .first()
      .click();
    await expect(page.locator("#dateGrid .date-cell.selected")).toHaveCSS(
      "background-color",
      "rgb(40, 101, 74)",
    );
    await expect(page.locator("#dateGrid .date-cell.selected")).toHaveCSS(
      "color",
      "rgb(255, 255, 255)",
    );
    await expect(page.locator("#dateGrid .date-cell.today")).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    expect(
      await page
        .locator("#dateGrid .date-cell.today")
        .evaluate((el) => getComputedStyle(el).boxShadow),
    ).toContain("inset");
    await expect(
      page.locator("#dateGrid .date-cell.selected > span").first(),
    ).toHaveCSS("text-decoration-line", "none");
    const actions = await page
      .locator(".panel-actions button")
      .evaluateAll((buttons) =>
        buttons.map((button) => {
          const style = getComputedStyle(button),
            rect = button.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(button);
          const text = range.getBoundingClientRect();
          return {
            height: rect.height,
            align: style.alignItems,
            justify: style.justifyContent,
            textOffset: text.top + text.height / 2 - rect.top - rect.height / 2,
          };
        }),
      );
    expect(actions[0].height).toBe(actions[1].height);
    expect(
      actions.every(
        (action) => action.align === "center" && action.justify === "center",
      ),
    ).toBeTruthy();
    expect(
      Math.abs(actions[0].textOffset - actions[1].textOffset),
    ).toBeLessThan(1);
    await page.locator("#panelQuick").click();
    await expect(page.locator("#quickForm")).toBeVisible();
    await page.locator("#closeModal").click();
    await page.locator("#panelAdd").click();
    const fields = await page
      .locator(
        "#eventDate,#eventStart,#eventEnd,#eventLocation,#eventPeople,#eventRepeat",
      )
      .evaluateAll((inputs) =>
        inputs.map((input) => {
          const rect = input.getBoundingClientRect(),
            style = getComputedStyle(input);
          return {
            id: input.id,
            height: rect.height,
            width: rect.width,
            font: style.fontSize,
            minWidth: style.minWidth,
          };
        }),
      );
    for (const field of fields) {
      expect(field.height).toBe(48);
      expect(Math.abs(field.width - fields[0].width)).toBeLessThan(1);
      expect(field.font).toBe("16px");
      expect(field.minWidth).toBe("0px");
    }
    await expect(page.locator("#eventDate")).toHaveAttribute("type", "date");
    await expect(page.locator("#eventStart")).toHaveAttribute("type", "time");
    await expect(page.locator("#eventEnd")).toHaveAttribute("type", "time");
    await page.locator("#eventTitle").fill("Native field layout check");
    await page.locator("#eventDate").fill("2026-10-12");
    await page.locator("#eventStart").fill("09:30");
    await page.locator("#eventEnd").fill("10:30");
    await expect(page.locator(".modal")).toHaveCSS("opacity", "1");
    await expect(page.locator("#modalBackdrop")).toHaveCSS("opacity", "1");
    await page.screenshot({
      path: testInfo.outputPath("native-fields.png"),
      animations: "disabled",
    });
    await page.locator('#eventForm button[type="submit"]').click();
    await expect(page.locator("#panelEvents")).toContainText(
      "Native field layout check",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  });
}
