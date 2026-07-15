import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page.js';

export class StatusReportPage extends BasePage {
  readonly informationCards: Locator;
  readonly errorRows: Locator;
  readonly warningRows: Locator;

  constructor(page: Page) {
    super(page);
    this.informationCards = page.locator('[data-testid="system-information-item"]');
    this.errorRows = page.locator('[data-testid="status-row"][data-severity="error"]');
    this.warningRows = page.locator('[data-testid="status-row"][data-severity="warning"]');
  }

  async goto(): Promise<void> { await super.goto('/admin/reports/status'); }

  private async getInformationText(label: string): Promise<string> {
    const card = this.informationCards.filter({ hasText: label }).first();
    await expect(card, `System information card not found: ${label}`).toBeVisible();
    return (await card.locator('[data-testid="value"]').innerText()).trim();
  }

  async expectApplicationVersion(version: string): Promise<void> {
    await expect.poll(() => this.getInformationText('Application Version')).toContain(version);
  }

  async expectRuntimeVersion(version: string): Promise<void> {
    await expect.poll(() => this.getInformationText('Runtime')).toContain(version);
  }

  async expectNoErrors(): Promise<void> {
    const labels = await this.errorRows.allInnerTexts();
    expect(labels, `Unexpected status errors:\n${labels.join('\n')}`).toHaveLength(0);
  }

  async getWarningLabels(): Promise<string[]> {
    return (await this.warningRows.allInnerTexts()).map((label) => label.trim());
  }
}
