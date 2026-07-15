# Automation Engineering: Basic-to-Pro Cheat Sheet

> **Confidentiality:** Automation assets may expose application behavior, URLs, data, and credentials. Store them only in approved repositories and use synthetic data.

## Test design

Use this structure:

```text
Given a known state
When the user performs one meaningful action
Then an observable business outcome occurs
```

Prefer independent tests. A test should create its own data or use a controlled fixture, validate the result, and clean up mutations.

## Page-object boundary

Put these in page objects:

- Locators.
- Reusable user actions.
- Page-specific assertions.
- URL navigation for the page.

Keep these in specs:

- Business scenario.
- Test data choice.
- Cross-page flow.
- Final business assertion.

Avoid a giant page object containing the whole application.

## Locator priority

1. `getByRole()` with an accessible name.
2. `getByLabel()` for inputs.
3. `getByPlaceholder()` when the placeholder is stable and meaningful.
4. `getByText()` for stable visible content.
5. `getByTestId()` for an explicit test contract.
6. CSS/XPath only when no semantic locator is possible.

Do not depend on generated classes, deep DOM chains, element indexes, or text that changes by environment.

## Wait strategy

Use Playwright auto-waiting and web-first assertions:

```ts
await expect(page.getByRole('status')).toContainText(/saved/i);
```

Avoid:

```ts
await page.waitForTimeout(5000);
```

A fixed wait is slow when the app is fast and flaky when the app is slower than expected. Wait for a user-visible state, response, URL, or element condition instead.

## Assertions after actions

After a meaningful action, assert its result:

```ts
await saveButton.click();
await expect(successMessage).toBeVisible();
```

Do not add redundant `not 500` checks to every test if a shared helper or global failure detection already covers server errors. Add them where server stability is the purpose of the scenario.

## Test data

- Use synthetic data only.
- Use unique identifiers for mutating tests.
- Prefer deterministic inputs for validation scenarios.
- Do not hard-code real emails, phone numbers, IDs, or production records.
- Delete created records when practical.

## Tags

Suggested title tags:

```text
Intent:   @smoke @regression @accessibility @health
Cost:     @fast @medium @slow
Behavior: @readOnly @mutates
Domain:   @auth @content @dashboard
```

Example:

```ts
test('administrator can sign in @smoke @fast @readOnly', async () => {});
```

## Skip rules

A skipped test must contain a clear reason and ideally a ticket:

```ts
test.skip(!process.env.FEATURE_ENABLED, 'TICKET-456: feature unavailable in this environment.');
```

Never keep indefinite `test.skip`, `test.only`, commented-out tests, or TODOs without ownership.

## Error handling

Do not catch failures merely to keep the test green. Catch only when you add context, clean up, or deliberately validate an expected failure.

## Authentication

- Use dedicated non-production accounts.
- Save authenticated state only in gitignored directories.
- Do not commit storage state because it can contain sensitive cookies and headers.
- Use a setup project or fixture when session reuse is safe.
- Use isolated accounts when parallel tests can change shared state.

## CRUD tests

A CRUD test should:

1. Create unique data.
2. Assert creation.
3. Capture the created ID reliably.
4. Edit and assert updated state.
5. Delete in a cleanup-safe step.
6. Confirm deletion with UI or API.

For critical systems, use `try/finally` or teardown fixtures so cleanup still runs after an assertion failure.

## Responsive testing

Use browser projects for broad cross-device execution. Use explicit viewport loops only for a focused responsive contract. Avoid assuming that viewport emulation validates real-device hardware, browser chrome, or network behavior.

## Code-review blockers

Reject or request changes for:

- Credentials, tokens, internal URLs, or customer data.
- `test.only` or unexplained skips.
- Arbitrary sleeps.
- Fragile selectors.
- Assertions missing after meaningful actions.
- Shared mutable data unsafe for parallel execution.
- Tests depending on execution order.
- Dead code, unused imports, debug logs, or duplicated logic.
- Broad catch blocks hiding failures.
- Unbounded retries or very large timeouts masking defects.
- A spec containing page-object implementation details.

## Definition of done

- Relevant tests pass locally.
- Lint and type check pass.
- CI passes.
- Tests are repeatable and independent.
- Data cleanup is handled.
- No confidential data is present.
- Documentation is updated when commands, variables, or structure change.
- PR/MR includes evidence and known limitations.
