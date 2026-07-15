# Framework Setup and Working Guide

> **Confidentiality:** Use only approved test environments and synthetic test data. Never commit credentials, cookies, tokens, real customer data, internal URLs, or client-specific material.

## Why these files exist

| File/folder | Responsibility |
|---|---|
| `playwright.config.ts` | Browser projects, timeouts, reports, retries, artifacts, and base URL |
| `fixtures/index.ts` | Creates reusable page objects and injects them into tests |
| `pages/` | Encapsulates locators and user actions; keeps specs readable |
| `fixtures/content-test-data.ts` | Stable reusable test data and unique test identifiers |
| `tests/` | Business-readable scenarios grouped by feature |
| `.env.example` | Documents required variables without exposing secrets |
| `.gitignore` | Blocks secrets, reports, sessions, and generated files |
| `eslint.config.js` | Enforces automation code quality rules |
| `tsconfig.json` | Enables strict TypeScript validation |

## Installation

```bash
npm ci
npx playwright install chromium
cp .env.example .env.local
```

Edit `.env.local` with credentials belonging to an approved non-production test account.

## Run commands

```bash
# All configured browser projects
npm run test:e2e

# Headed browser
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui

# Debug mode with Playwright Inspector
npm run test:e2e:debug

# One folder
npx playwright test -c tests/playwright/playwright.config.ts tests/playwright/tests/content

# One file
npx playwright test -c tests/playwright/playwright.config.ts tests/playwright/tests/auth/login.spec.ts

# One test by title
npx playwright test -c tests/playwright/playwright.config.ts -g "invalid credentials"

# One browser/device project
npx playwright test -c tests/playwright/playwright.config.ts --project=mobile-chromium

# Smoke suite
npm run test:e2e:smoke

# Open last HTML report
npm run test:e2e:report
```

## Debugging sequence

1. Re-run the single failed test with `--headed`.
2. Use `--debug` or UI mode and inspect each action.
3. Open the trace from the HTML report.
4. Confirm the locator targets one stable, user-visible element.
5. Check network responses, console errors, redirects, and test data.
6. Compare local and CI environment configuration.
7. Fix the cause; do not hide instability with arbitrary sleeps or excessive retries.

```bash
npx playwright test -c tests/playwright/playwright.config.ts path/to/file.spec.ts --headed --debug
```

## Viewport approaches

Use configured projects when the whole suite should run on desktop, tablet, and mobile. Use `page.setViewportSize()` only when one scenario intentionally compares explicit sizes. See `tests/playwright/tests/responsive/responsive-example.spec.ts`.

## Training comments versus production comments

Training-only comment:

```ts
// REFERENCE NOTE: The locator is declared here so beginners can see the POM pattern.
// Remove this explanation from production code.
```

Useful production comment:

```ts
// The API updates asynchronously; poll the visible status instead of using a fixed delay.
```

The first explains syntax and should live in this guide. The second records a non-obvious technical reason and may remain in production.
