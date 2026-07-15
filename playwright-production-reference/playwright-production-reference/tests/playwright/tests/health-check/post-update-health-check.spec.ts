import { test, expect } from '../../fixtures/index.js';

const expectedApplicationVersion = process.env.EXPECTED_CMS_VERSION;
const expectedRuntimeVersion = process.env.EXPECTED_RUNTIME_VERSION;
const logWindowMinutes = Number(process.env.LOG_WINDOW_MINUTES ?? '30');

test.describe('Post-update health check @health', () => {
  test.beforeAll(() => {
    if (!expectedApplicationVersion || !expectedRuntimeVersion) {
      throw new Error('EXPECTED_CMS_VERSION and EXPECTED_RUNTIME_VERSION must be configured.');
    }
    if (!Number.isFinite(logWindowMinutes) || logWindowMinutes <= 0) {
      throw new Error('LOG_WINDOW_MINUTES must be a positive number.');
    }
  });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.loginAs('admin');
    await loginPage.expectNotOnLoginPage();
  });

  test('status report contains expected versions and no errors @smoke @medium @readOnly', async ({ page, statusReportPage }) => {
    await statusReportPage.goto();
    await statusReportPage.expectApplicationVersion(expectedApplicationVersion!);
    await statusReportPage.expectRuntimeVersion(expectedRuntimeVersion!);
    await statusReportPage.expectNoErrors();
    await expect(page).not.toHaveTitle(/500|server error/i);

    const warnings = await statusReportPage.getWarningLabels();
    if (warnings.length > 0) {
      test.info().annotations.push({ type: 'status-warnings', description: warnings.join('\n') });
    }
  });

  test('no recent error log entries exist @regression @medium @readOnly', async ({ systemLogPage }) => {
    await systemLogPage.goto();
    await systemLogPage.filterBySeverity('Error');
    const errors = await systemLogPage.getEntriesWithinWindow(logWindowMinutes);
    expect(errors, `Recent errors:\n${errors.map((item) => `${item.dateText}: ${item.message}`).join('\n')}`).toHaveLength(0);
  });
});
