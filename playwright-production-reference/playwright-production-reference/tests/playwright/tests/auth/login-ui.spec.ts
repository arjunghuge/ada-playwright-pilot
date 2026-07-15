import { test, expect } from '../../fixtures/index.js';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login form UI @auth @ui', () => {
  test.beforeEach(async ({ loginPage }) => { await loginPage.goto(); });

  test('shows required controls @smoke @fast @readOnly', async ({ page, loginPage }) => {
    await loginPage.expectFormVisible();
    await expect(page).toHaveURL(/\/login/);
    await expect(page).not.toHaveTitle(/500|server error/i);
  });

  test('password remains masked @regression @fast @readOnly', async ({ loginPage }) => {
    await loginPage.passwordInput.fill('example-password');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('keyboard order reaches password and submit @accessibility @fast @readOnly', async ({ page, loginPage }) => {
    await loginPage.usernameInput.focus();
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(loginPage.submitButton).toBeFocused();
  });
});
