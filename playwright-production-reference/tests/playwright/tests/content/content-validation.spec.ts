import { test, expect } from '../../fixtures/index.js';
import { ARTICLE_CONTENT, PAGE_CONTENT } from '../../fixtures/content-test-data.js';

test.describe('Content validation @content @validation', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.loginAs('admin');
    await loginPage.expectNotOnLoginPage();
  });

  test('required title blocks empty submission @regression @fast @readOnly', async ({ page, contentPage }) => {
    await contentPage.gotoAddForm(PAGE_CONTENT.machineName);
    await contentPage.save();
    await expect(page).toHaveURL(new RegExp(`/admin/content/add/${PAGE_CONTENT.machineName}`));
    await contentPage.expectRequiredFieldBlocksSubmission(contentPage.titleInput);
  });

  test('URL field exposes accessible help text @regression @fast @readOnly', async ({ contentPage }) => {
    await contentPage.gotoAddForm(ARTICLE_CONTENT.machineName);
    await contentPage.expectFieldDescriptionContains(
      ARTICLE_CONTENT.linkFieldId,
      ARTICLE_CONTENT.linkDescriptionText,
    );
  });
});
