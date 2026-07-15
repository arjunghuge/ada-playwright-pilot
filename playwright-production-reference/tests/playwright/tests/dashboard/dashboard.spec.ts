import { test, expect } from '../../fixtures/index.js';

const username = process.env.END_USER_USERNAME;

test.describe('Dashboard @dashboard', () => {
  test.beforeEach(async ({ loginPage }) => {
    test.skip(!username, 'END_USER_USERNAME is not configured.');
    await loginPage.loginAs('endUser');
    await loginPage.expectNotOnLoginPage();
  });

  test('dashboard displays navigation and greeting @smoke @fast @readOnly', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.expectNavigation();
    await dashboardPage.expectWelcomeMessage(username!, 'desktop');
    await expect(page).not.toHaveTitle(/500|server error/i);
  });
});
