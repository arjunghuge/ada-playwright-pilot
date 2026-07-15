import { test, expect } from '../../fixtures/index.js';

test.describe('Authentication @auth', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('administrator can sign in @smoke @fast @readOnly', async ({ page, loginPage }) => {
    await loginPage.loginAs('admin');
    await loginPage.expectNotOnLoginPage();
    await expect(loginPage.adminToolbar).toBeVisible();
    await expect(page).not.toHaveTitle(/500|server error/i);
  });

  test('invalid credentials show a safe error @regression @fast @readOnly', async ({ page, loginPage }) => {
    await loginPage.loginWith('invalid@example.test', 'invalid-password');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).not.toContainText(/500|fatal|exception|stack trace/i);
    await expect(page).not.toHaveTitle(/500|server error/i);
  });
});
