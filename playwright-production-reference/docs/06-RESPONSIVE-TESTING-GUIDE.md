# Responsive Playwright Testing: Step-by-Step Guide

> **Confidentiality:** Use only invented test data and example URLs in training material. Never commit credentials, authenticated state, client data, screenshots, internal URLs, or proprietary selectors.

This guide explains how one Playwright test can cover desktop, laptop, tablet, and mobile layouts without duplicating the test logic.

## 1. Files used by the example

```text
tests/playwright/
├── playwright.config.ts
├── fixtures/index.ts
├── pages/
│   ├── base-page.ts
│   └── responsive-orders-page.ts
└── tests/responsive/
    └── orders-responsive.spec.ts
```

### Responsibility of each file

- `playwright.config.ts`: Defines the base URL, browser/device projects, timeouts, retries, reports, screenshots, videos, and traces.
- `base-page.ts`: Provides shared navigation behaviour for every Page Object.
- `responsive-orders-page.ts`: Owns selectors, responsive layout decisions, page actions, and reusable page assertions.
- `fixtures/index.ts`: Creates Page Objects once per test and injects them into specs.
- `orders-responsive.spec.ts`: Describes user behaviour and expected outcomes. It should not contain repeated selectors.

## 2. How the URL comes from `.env`

`.env.local`:

```dotenv
TEST_BASE_URL=https://test.example.com
TEST_USERNAME=automation-user
TEST_PASSWORD=replace-with-secret
```

`playwright.config.ts` loads the value:

```ts
const baseURL = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  use: { baseURL },
});
```

The Page Object uses only a relative URL:

```ts
async goto(): Promise<void> {
  await super.goto('/orders');
}
```

Playwright combines them:

```text
https://test.example.com + /orders
= https://test.example.com/orders
```

Do not hard-code environment URLs inside test files or Page Objects.

## 3. Base Page purpose

```ts
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}
```

Use a Base Page for genuinely shared behaviour such as navigation, page title, loading indicators, and common error checks. Do not turn it into a large utility class containing unrelated page behaviour.

## 4. Why use fixtures

Without a fixture, every test repeats this:

```ts
const ordersPage = new ResponsiveOrdersPage(page);
```

A typed fixture creates it consistently:

```ts
responsiveOrdersPage: async ({ page }, use) => {
  await use(new ResponsiveOrdersPage(page));
},
```

The test receives it directly:

```ts
test('shows orders', async ({ responsiveOrdersPage }) => {
  await responsiveOrdersPage.goto();
});
```

Fixtures reduce duplicate setup and keep test dependencies explicit. Each test still receives an isolated browser context and page.

## 5. Desktop, laptop, tablet, and mobile projects

The config defines four projects:

```ts
projects: [
  {
    name: 'desktop-chromium',
    use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
  },
  {
    name: 'laptop-chromium',
    use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
  },
  {
    name: 'tablet-chromium',
    use: { ...devices['iPad (gen 7)'] },
  },
  {
    name: 'mobile-chromium',
    use: { ...devices['Pixel 7'] },
  },
],
```

Running the spec normally executes it in all configured projects:

```bash
npx playwright test -c tests/playwright/playwright.config.ts \
  tests/playwright/tests/responsive/orders-responsive.spec.ts
```

### Run only one viewport project

```bash
# Mobile only
npx playwright test -c tests/playwright/playwright.config.ts \
  tests/playwright/tests/responsive/orders-responsive.spec.ts \
  --project=mobile-chromium

# Tablet only
npx playwright test -c tests/playwright/playwright.config.ts \
  tests/playwright/tests/responsive/orders-responsive.spec.ts \
  --project=tablet-chromium

# Laptop only
npx playwright test -c tests/playwright/playwright.config.ts \
  tests/playwright/tests/responsive/orders-responsive.spec.ts \
  --project=laptop-chromium

# Desktop only
npx playwright test -c tests/playwright/playwright.config.ts \
  tests/playwright/tests/responsive/orders-responsive.spec.ts \
  --project=desktop-chromium
```

### Run selected projects together

```bash
npx playwright test -c tests/playwright/playwright.config.ts \
  tests/playwright/tests/responsive/orders-responsive.spec.ts \
  --project=desktop-chromium \
  --project=mobile-chromium
```

This is the preferred way to enable or disable viewports for a run. There is no need to edit or comment out config code.

### Override viewport inside one file

Use this only when the entire file requires a special viewport:

```ts
test.use({ viewport: { width: 390, height: 844 } });
```

Avoid calling `page.setViewportSize()` repeatedly when Playwright projects already represent the supported devices. Projects also emulate device characteristics beyond width and height.

## 6. Same CSS and same DOM structure across viewports

When the same element remains in the DOM and only CSS changes its layout, use one semantic locator:

```ts
const ordersRegion = page.getByTestId('orders-list');
const orderLink = ordersRegion.getByRole('link', { name: /view order/i });
```

Do not create separate `desktopOrderLink` and `mobileOrderLink` locators when the DOM and accessible name are the same.

Only branch by viewport when the application genuinely renders different controls or structures, such as:

- Desktop/tablet: HTML table rows.
- Mobile: order cards.
- Desktop: full navigation.
- Mobile: hamburger button.

Keep that branch inside the Page Object:

```ts
if (await this.isMobileLayout()) {
  // Assert mobile card.
} else {
  // Assert table row.
}
```

The spec remains business-focused:

```ts
await responsiveOrdersPage.expectOrderVisible(exampleOrder);
```

## 7. Locator priority

Use locators in this order:

1. `getByRole()` with accessible name.
2. `getByLabel()` for inputs.
3. `getByPlaceholder()` when the placeholder is the intended user contract.
4. `getByText()` for stable visible content.
5. `getByTestId()` for stable component hooks.
6. CSS selectors only when no reliable user-facing selector exists.

Good:

```ts
page.getByRole('button', { name: /save/i });
page.getByLabel('Email address');
page.getByTestId('orders-list');
```

Avoid:

```ts
page.locator('div:nth-child(3) > div > button');
page.locator('.button-blue-large-v2');
```

Avoid `:has-text()` when a role-based locator can express the same intent. Scope locators to a stable parent before searching for a child.

## 8. TypeScript essentials

Use explicit reusable types for structured test data:

```ts
export type OrderExpectation = {
  id: string;
  customer: string;
  status: string;
  total: string;
};
```

Use `as const` for fixed test data:

```ts
const exampleOrder = {
  id: 'ORD-1001',
  status: 'Processing',
} as const;
```

Use `Promise<void>` for asynchronous methods that do not return a value. Avoid `any`; prefer a real type or `unknown` with validation.

## 9. Robust assertions

Prefer Playwright's web-first assertions because they retry until the expected state appears or the assertion timeout expires:

```ts
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Processing');
await expect(page).toHaveURL(/\/orders\/ORD-1001/);
```

Avoid immediate checks that do not retry:

```ts
expect(await locator.isVisible()).toBe(true);
```

Give assertions meaningful messages only when they add useful debugging context:

```ts
await expect(row, `Order row ${order.id} should be visible`).toBeVisible();
```

Do not add `not.toHaveTitle(/500/)` after every action. A focused page readiness check, expected destination assertion, and application-specific error monitor are more useful than repeated generic assertions.

## 10. Actions and assertions: two valid patterns

### Pattern A: Action and assertion separated

```ts
await ordersPage.openOrder('ORD-1001');
await ordersPage.expectOrderDetailsOpened('ORD-1001');
```

Use this when different tests may reuse the action but verify different outcomes.

### Pattern B: Business workflow method

```ts
async openOrderAndConfirm(orderId: string): Promise<void> {
  await this.openOrder(orderId);
  await this.expectOrderDetailsOpened(orderId);
}
```

Use this when the action and destination are always one inseparable business operation.

Do not hide every assertion inside actions. A test must still clearly show its intended outcome.

## 11. Multi-step forms and regression isolation

Suppose a form has three steps. Avoid one giant test that validates everything:

```ts
// Fragile: a Step 1 validation failure prevents Step 2 and Step 3 coverage.
test('completes and validates all steps', async () => {
  // Step 1 validations
  // Step 2 validations
  // Step 3 validations
});
```

Create independent tests:

```ts
test('Step 1 validates required account fields', async ({ formPage }) => {
  await formPage.gotoStepOne();
  await formPage.submitStepOne();
  await formPage.expectStepOneRequiredErrors();
});

test('Step 2 validates address fields', async ({ formPage, request }) => {
  await formPage.createDraftAtStepTwo(request);
  await formPage.gotoStepTwoDraft();
  await formPage.submitStepTwo();
  await formPage.expectStepTwoRequiredErrors();
});
```

Prepare the required state for Step 2 through one of these methods, in preferred order:

1. API or backend helper creates a draft already positioned at Step 2.
2. A dedicated fixture creates the prerequisite state.
3. A minimal UI helper completes Step 1 without asserting every Step 1 rule.
4. Reuse authenticated `storageState` only for login state, not as a substitute for business-data setup.

A navigation helper may perform the minimum required checks:

```ts
async completeStepOne(data: StepOneData): Promise<void> {
  await this.fillStepOne(data);
  await this.nextButton.click();
  await expect(this.stepTwoHeading).toBeVisible(); // transition readiness only
}
```

This assertion is not retesting all Step 1 validations. It confirms that setup reached Step 2 successfully.

Never make Test B depend on Test A having run first. Playwright tests should be independently runnable and order-independent.

## 12. Session restoration

Use saved authenticated state when login is stable and reused by many tests:

```ts
use: {
  storageState: 'tests/playwright/.auth/user.json',
}
```

Important rules:

- Add `.auth/` to `.gitignore` because it may contain sensitive cookies or tokens.
- Generate state in a setup project or fixture.
- Recreate it when expired.
- Use separate accounts when parallel tests modify shared server state.
- Do not reuse one account concurrently when the application invalidates earlier sessions.

If the server requires a cookie that cannot be restored reliably, use a worker-scoped login fixture or a documented session manager that verifies the restored session before using it.

## 13. Bot-detection and automation-sensitive login

First use stable application-supported solutions:

- Disable CAPTCHA or bot protection in the dedicated automation environment.
- Allowlist the test runner through an approved environment configuration.
- Create authenticated state through a test API when permitted.
- Reuse validated storage state.

Avoid fixed sleeps such as `waitForTimeout(3000)`. They slow every run and remain flaky. Prefer waiting for a real readiness condition:

```ts
await expect(loginPage.usernameInput).toBeEditable();
await expect(loginPage.submitButton).toBeEnabled();
```

If a vendor-controlled protection requires human-like typing, isolate it in the login helper, document the reason, and keep it configurable. Do not spread delayed typing and sleeps across specs.

## 14. Debugging commands

```bash
# Headed
npx playwright test -c tests/playwright/playwright.config.ts \
  tests/playwright/tests/responsive/orders-responsive.spec.ts --headed

# UI mode
npx playwright test -c tests/playwright/playwright.config.ts --ui

# Debug one test/project
npx playwright test -c tests/playwright/playwright.config.ts \
  tests/playwright/tests/responsive/orders-responsive.spec.ts \
  --project=mobile-chromium --debug

# Run by title
npx playwright test -c tests/playwright/playwright.config.ts \
  --grep "opens an order"

# Open the latest HTML report
npx playwright show-report tests/reports/playwright/html

# Inspect a saved trace
npx playwright show-trace path/to/trace.zip
```

Useful debugging order:

1. Read the first failure and assertion message.
2. Open the trace.
3. Inspect the locator and accessibility tree.
4. Confirm environment data and user permissions.
5. Compare the current DOM with the Page Object selector.
6. Check network/API failures.
7. Reproduce with one test and one project.
8. Add a targeted wait only for a real application state—not a random timeout.

## 15. Production review checklist

Before committing:

- The test runs independently.
- It passes in the required projects.
- No `.only`, accidental `.skip`, fixed sleep, real credentials, internal URL, or generated artifact is committed.
- Locators are semantic and scoped.
- Repeated selectors/actions are moved into Page Objects or helpers.
- Test data is deterministic and isolated.
- Assertions verify the intended outcome, not implementation details.
- Mobile-specific branching exists only when the DOM or user interaction genuinely differs.
- Teaching comments have been removed from production specs.
