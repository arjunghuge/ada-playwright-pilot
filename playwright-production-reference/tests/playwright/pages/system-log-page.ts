import { type Page } from '@playwright/test';
import { BasePage } from './base-page.js';

export type LogEntry = { timestamp: Date; dateText: string; type: string; message: string };

export class SystemLogPage extends BasePage {
  constructor(page: Page) { super(page); }
  async goto(): Promise<void> { await super.goto('/admin/reports/logs'); }

  async filterBySeverity(severity: 'Error' | 'Warning'): Promise<void> {
    await this.page.getByLabel(/severity/i).selectOption({ label: severity });
    await this.page.getByRole('button', { name: /filter|apply/i }).click();
  }

  async resetFilters(): Promise<void> {
    await this.page.getByRole('button', { name: /reset/i }).click();
  }

  async getEntriesWithinWindow(minutes: number): Promise<LogEntry[]> {
    const cutoff = Date.now() - minutes * 60_000;
    const rows = this.page.locator('[data-testid="log-row"]');
    const entries: LogEntry[] = [];

    for (let index = 0; index < await rows.count(); index += 1) {
      const row = rows.nth(index);
      const dateText = (await row.locator('[data-testid="log-date"]').innerText()).trim();
      const timestamp = new Date(dateText);
      if (!Number.isNaN(timestamp.valueOf()) && timestamp.valueOf() >= cutoff) {
        entries.push({
          timestamp,
          dateText,
          type: (await row.locator('[data-testid="log-type"]').innerText()).trim(),
          message: (await row.locator('[data-testid="log-message"]').innerText()).trim(),
        });
      }
    }
    return entries;
  }
}
