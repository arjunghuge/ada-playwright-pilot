import { test, expect } from '../../fixtures/index.js';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`login form works on ${viewport.name} @responsive @fast @readOnly`, async ({ page, loginPage }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await loginPage.goto();
    await loginPage.expectFormVisible();
    await expect(page).not.toHaveTitle(/500|server error/i);
  });
}
