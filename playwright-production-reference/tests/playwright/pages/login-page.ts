import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page.js';

type UserRole = 'admin' | 'editor' | 'endUser';

const credentialsByRole: Record<UserRole, { usernameEnv: string; passwordEnv: string }> = {
  admin: { usernameEnv: 'ADMIN_USERNAME', passwordEnv: 'ADMIN_PASSWORD' },
  editor: { usernameEnv: 'EDITOR_USERNAME', passwordEnv: 'EDITOR_PASSWORD' },
  endUser: { usernameEnv: 'END_USER_USERNAME', passwordEnv: 'END_USER_PASSWORD' },
};

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly resetPasswordLink: Locator;
  readonly languageSwitcher: Locator;
  readonly adminToolbar: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel(/username|email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /log in|sign in/i });
    this.errorMessage = page.getByRole('alert');
    this.resetPasswordLink = page.getByRole('link', { name: /reset.*password|forgot.*password/i });
    this.languageSwitcher = page.getByRole('navigation', { name: /language/i });
    this.adminToolbar = page.getByRole('navigation', { name: /admin|toolbar/i });
  }

  async goto(): Promise<void> {
    await super.goto('/login');
  }

  async loginWith(username: string, password: string): Promise<void> {
    await this.goto();
    await expect(this.usernameInput).toBeEditable();
    await expect(this.passwordInput).toBeEditable();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAs(role: UserRole): Promise<void> {
    const config = credentialsByRole[role];
    const username = process.env[config.usernameEnv];
    const password = process.env[config.passwordEnv];

    if (!username || !password) {
      throw new Error(`Missing credentials: ${config.usernameEnv} and ${config.passwordEnv} must be configured.`);
    }

    await this.loginWith(username, password);
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
  }

  async expectNotOnLoginPage(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login/);
  }

  async logout(): Promise<void> {
    await super.goto('/logout');
  }
}
