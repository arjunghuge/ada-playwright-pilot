import { test, expect } from '../../fixtures/index.js';

const exampleOrder = {
  id: 'ORD-1001',
  customer: 'Example Customer',
  status: 'Processing',
  total: '$125.00',
} as const;

/**
 * REFERENCE NOTE:
 * Comments in this file are intentionally detailed for training.
 * Remove teaching-only comments when copying the pattern into production.
 */
test.describe('Responsive orders UI @responsive', () => {
  test.beforeEach(async ({ responsiveOrdersPage }) => {
    // The custom fixture creates the Page Object with Playwright's current page.
    // This removes repeated `new ResponsiveOrdersPage(page)` code from specs.
    await responsiveOrdersPage.goto();

    // Keep beforeEach lightweight. Do not place every possible page assertion
    // here because one shared failure would block all tests in this describe.
    // This is a minimal readiness assertion only.
    await expect(responsiveOrdersPage.heading).toBeVisible();
  });

  test('shows the correct navigation and order layout @smoke @readOnly', async ({ responsiveOrdersPage }) => {
    await responsiveOrdersPage.expectCorrectNavigationForViewport();
    await responsiveOrdersPage.expectOrderVisible(exampleOrder);
  });

  test('opens an order from either the table row or mobile card @regression @readOnly', async ({ responsiveOrdersPage }) => {

    // Action and destination assertion are intentionally separate methods.
    // This lets another test call openOrder() without repeating unrelated
    // assertions from the earlier page when its goal is the details screen.
    await responsiveOrdersPage.openOrder(exampleOrder.id);
    await responsiveOrdersPage.expectOrderDetailsOpened(exampleOrder.id);
  });
});
