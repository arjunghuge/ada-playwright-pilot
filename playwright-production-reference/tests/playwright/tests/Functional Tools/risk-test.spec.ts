import { test } from '../../fixtures/index.js';

test('Complete Risk Test for myself', async ({ riskTestPage }) => {
  await riskTestPage.open();

  await riskTestPage.selectForMyself();
  await riskTestPage.selectAgeUnder18();
  await riskTestPage.selectGenderMan();

  await riskTestPage.selectYes();
  await riskTestPage.selectNo();
  await riskTestPage.selectYes();

  await riskTestPage.selectNotHispanic();
  await riskTestPage.selectAsian();

  await riskTestPage.selectHeight();
  await riskTestPage.selectWeight();

  await riskTestPage.selectYes();

  await riskTestPage.showResults();
});