import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page.js';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Orders', href: '/orders' },
  { label: 'Products', href: '/products' },
  { label: 'Profile', href: '/profile' },
] as const;

export class DashboardPage extends BasePage {
  readonly navigation: Locator;
  readonly desktopGreeting: Locator;
  readonly mobileGreeting: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = page.getByRole('navigation', { name: /account|dashboard/i });
    this.desktopGreeting = page.locator('[data-testid="desktop-greeting"]');
    this.mobileGreeting = page.locator('[data-testid="mobile-greeting"]');
  }

  async goto(): Promise<void> { await super.goto('/dashboard'); }
  navLink(label: string): Locator { return this.navigation.getByRole('link', { name: label, exact: true }); }

  async expectWelcomeMessage(username: string, mode: 'desktop' | 'mobile'): Promise<void> {
    const greeting = mode === 'desktop' ? this.desktopGreeting : this.mobileGreeting;
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText(username);
  }

  async expectNavigation(): Promise<void> {
    await expect(this.navigation).toBeVisible();
    for (const item of NAV_ITEMS) {
      await expect(this.navLink(item.label)).toHaveAttribute('href', item.href);
    }
  }
}
