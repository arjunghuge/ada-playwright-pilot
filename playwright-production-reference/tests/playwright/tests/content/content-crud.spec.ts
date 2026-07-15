import { test, expect } from '../../fixtures/index.js';
import { ARTICLE_CONTENT, PAGE_CONTENT, uniqueTitle } from '../../fixtures/content-test-data.js';

const CONTENT_TYPES = [ARTICLE_CONTENT, PAGE_CONTENT] as const;

test.describe('Content CRUD @content', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.loginAs('admin');
    await loginPage.expectNotOnLoginPage();
  });

  for (const contentType of CONTENT_TYPES) {
    test(`create, edit, and delete ${contentType.machineName} @regression @medium @mutates`, async ({ contentPage }) => {
      const title = uniqueTitle(contentType.titlePrefix);

      await test.step('Create', async () => {
        await contentPage.gotoAddForm(contentType.machineName);
        await contentPage.fillTitle(title);
        await contentPage.save();
        await contentPage.expectSavedSuccessfully();
      });

      const id = contentPage.getContentIdFromUrl();
      expect(id, 'Expected a content ID after creation').not.toBeNull();

      await test.step('Edit', async () => {
        const updatedTitle = `${title} edited`;
        await contentPage.gotoEditForm(id!);
        await contentPage.fillTitle(updatedTitle);
        await contentPage.save();
        await contentPage.expectSavedSuccessfully();
        await contentPage.gotoView(id!);
        await contentPage.expectTitleVisible(updatedTitle);
      });

      await test.step('Delete', async () => {
        await contentPage.gotoDeleteForm(id!);
        await contentPage.deleteCurrentContent();
        await contentPage.expectContentDeleted(id!);
      });
    });
  }
});
