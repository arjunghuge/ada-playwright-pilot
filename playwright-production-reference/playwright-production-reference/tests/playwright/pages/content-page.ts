import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page.js';

export class ContentPage extends BasePage {
  readonly titleInput: Locator;
  readonly summaryInput: Locator;
  readonly linkUrlInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByLabel('Title', { exact: true });
    this.summaryInput = page.getByLabel(/summary/i);
    this.linkUrlInput = page.getByLabel(/link url|url/i);
    this.saveButton = page.getByRole('button', { name: /save/i });
  }

  async gotoAddForm(contentType: string): Promise<void> { await super.goto(`/admin/content/add/${contentType}`); }
  async gotoEditForm(id: string): Promise<void> { await super.goto(`/admin/content/${id}/edit`); }
  async gotoDeleteForm(id: string): Promise<void> { await super.goto(`/admin/content/${id}/delete`); }
  async gotoView(id: string): Promise<void> { await super.goto(`/content/${id}`); }

  async fillTitle(title: string): Promise<void> { await this.titleInput.fill(title); }
  async fillSummary(summary: string): Promise<void> { await this.summaryInput.fill(summary); }
  async fillLinkUrl(url: string): Promise<void> { await this.linkUrlInput.fill(url); }
  async save(): Promise<void> { await this.saveButton.click(); }

  async expectSavedSuccessfully(): Promise<void> {
    await expect(this.page.getByRole('status')).toContainText(/saved|created|updated/i);
  }

  async expectTitleVisible(title: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }

  async expectRequiredFieldBlocksSubmission(field: Locator): Promise<void> {
    await expect(field).toHaveJSProperty('validity.valid', false);
  }

  async expectFieldDescriptionContains(fieldId: string, text: string): Promise<void> {
    const field = this.page.locator(`#${fieldId}`);
    const descriptionId = await field.getAttribute('aria-describedby');
    expect(descriptionId, `Expected #${fieldId} to reference help text with aria-describedby`).toBeTruthy();
    await expect(this.page.locator(`#${descriptionId}`)).toContainText(text);
  }

  getContentIdFromUrl(): string | null {
    return this.page.url().match(/\/content\/(\d+)/)?.[1] ?? null;
  }

  async deleteCurrentContent(): Promise<void> {
    await this.page.getByRole('button', { name: /delete/i }).click();
  }

  async expectContentDeleted(id: string): Promise<void> {
    const response = await this.page.request.get(`/content/${id}`);
    expect([404, 410]).toContain(response.status());
  }
}
