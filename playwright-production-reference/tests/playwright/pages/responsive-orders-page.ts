import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page.js';

export type OrderExpectation = {
  id: string;
  customer: string;
  status: string;
  total: string;
};

/**
 * Page Object for a responsive orders screen.
 *
 * Production note:
 * Keep selectors and page interactions here. Specs should describe behaviour,
 * not repeat CSS selectors or branch heavily for every viewport.
 */
export class ResponsiveOrdersPage extends BasePage {
  readonly heading: Locator;
  readonly ordersRegion: Locator;
  readonly desktopTable: Locator;
  readonly mobileCards: Locator;
  readonly mobileMenuButton: Locator;
  readonly desktopNavigation: Locator;

  constructor(page: Page) {
    super(page);

    // Prefer accessible selectors. A stable data-testid is acceptable for a
    // component container whose semantic role is not unique enough.
    this.heading = page.getByRole('heading', { name: /orders/i, level: 1 });
    this.ordersRegion = page.getByTestId('orders-list');
    this.desktopTable = this.ordersRegion.getByRole('table', { name: /orders/i });
    this.mobileCards = this.ordersRegion.locator('[data-testid="order-card"]');
    this.mobileMenuButton = page.getByRole('button', { name: /open navigation/i });
    this.desktopNavigation = page.getByRole('navigation', { name: /primary/i });
  }

  async goto(): Promise<void> {
    // The baseURL comes from playwright.config.ts, which reads TEST_BASE_URL
    // from .env or .env.local. Keep relative paths in Page Objects.
    await super.goto('/orders');
  }

  /**
   * Confirms that the page is ready for later actions.
   * Use this only when page readiness is part of the test's purpose or when
   * the next action cannot be safely attempted without a minimal readiness check.
   */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/orders(?:[/?#]|$)/);
    await expect(this.heading).toBeVisible();
    await expect(this.ordersRegion).toBeVisible();
  }

  /** Returns true when the current browser viewport is in the mobile layout. */
  async isMobileLayout(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    if (!viewport) {
      throw new Error('Viewport size is unavailable. Run this test in a browser context with a viewport.');
    }

    // This breakpoint must match the application's responsive design token.
    return viewport.width < 768;
  }

  /**
   * Verifies only the responsive shell, not the order data.
   * This keeps layout assertions separate from business-data assertions.
   */
  async expectCorrectNavigationForViewport(): Promise<void> {
    if (await this.isMobileLayout()) {
      await expect(this.mobileMenuButton).toBeVisible();
      await expect(this.desktopNavigation).toBeHidden();
      return;
    }

    await expect(this.desktopNavigation).toBeVisible();
    await expect(this.mobileMenuButton).toBeHidden();
  }

  /**
   * Verifies the same business record regardless of whether the UI renders
   * a table row or a mobile card.
   */
  async expectOrderVisible(order: OrderExpectation): Promise<void> {
    if (await this.isMobileLayout()) {
      const card = this.mobileCards.filter({ hasText: order.id });
      await expect(card, `Mobile order card ${order.id} should be visible`).toBeVisible();
      await expect(card).toContainText(order.customer);
      await expect(card).toContainText(order.status);
      await expect(card).toContainText(order.total);
      return;
    }

    const row = this.desktopTable.getByRole('row').filter({ hasText: order.id });
    await expect(row, `Order table row ${order.id} should be visible`).toBeVisible();
    await expect(row.getByRole('cell', { name: order.customer, exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: order.status, exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: order.total, exact: true })).toBeVisible();
  }

  /**
   * Opens an order using the control available in the current layout.
   * The spec does not need to know whether the control is inside a row or card.
   */
  async openOrder(orderId: string): Promise<void> {
    const container = (await this.isMobileLayout())
      ? this.mobileCards.filter({ hasText: orderId })
      : this.desktopTable.getByRole('row').filter({ hasText: orderId });

    await container.getByRole('link', { name: /view order/i }).click();
  }

  /** Assertion kept separate so tests may choose when navigation validation matters. */
  async expectOrderDetailsOpened(orderId: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/orders/${orderId}(?:[/?#]|$)`));
    await expect(this.page.getByRole('heading', { name: new RegExp(orderId, 'i') })).toBeVisible();
  }
}
