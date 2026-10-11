const { test, expect } = require('@playwright/test');

test('calendar loads and core navigation works', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await expect(page.locator('#homeScreen')).toHaveClass(/active/);
  await expect(page.locator('#heroDate')).not.toBeEmpty();

  await page.locator('[data-screen="calendar"]').click();
  await expect(page.locator('#calendarScreen')).toHaveClass(/active/);
  await expect(page.locator('#monthTitle')).not.toBeEmpty();
  await expect(page.locator('[data-date]').first()).toBeVisible();

  await page.locator('[data-date]').first().click();
  await page.locator('#panelAdd').click();
  await expect(page.locator('#eventForm')).toBeVisible();
  await page.locator('#eventTitle').fill('Playwright smoke test');
  await page.locator('#eventDate').fill('2026-10-12');
  await page.locator('#eventForm button[type="submit"]').click();
  await expect(page.locator('#toast')).toContainText('Event added');
  await expect(page.locator('#panelEvents')).toContainText('Playwright smoke test');

  expect(pageErrors).toEqual([]);
});


test('dark appearance covers the calendar and event form surfaces', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-screen="settings"]').click();
  await expect(page.locator('#settingsScreen')).toHaveClass(/active/);
  await page.locator('#appearanceToggle').click();
  await expect(page.locator('.app')).toHaveClass(/settings-dark/);

  const shellBackground = await page.locator('.app').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(shellBackground).toBe('rgb(21, 27, 23)');

  await page.locator('[data-screen="calendar"]').click();
  const calendarSurface = await page.locator('.date-cell:not(.selected)').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(calendarSurface).toBe('rgb(27, 36, 30)');

  await page.locator('[data-date]').first().click();
  await page.locator('#panelAdd').click();
  await expect(page.locator('#eventForm')).toBeVisible();
  const modalSurface = await page.locator('.modal').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(modalSurface).toBe('rgb(27, 36, 30)');

  const formControlSurface = await page.locator('#eventTitle').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(formControlSurface).toBe('rgb(27, 36, 30)');
});

test('manifest is linked and service worker enables offline shell', async ({ page, context }) => {
  await page.goto('/');
  expect(await page.locator('link[rel="manifest"]').getAttribute('href')).toBe('./manifest.webmanifest');

  const manifestResponse = await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('./');

  const waitForController = () => page.waitForFunction(
    () => 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null,
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
  await expect(page.locator('#homeScreen')).toHaveClass(/active/);
  await expect(page.locator('#heroDate')).not.toBeEmpty();
});
