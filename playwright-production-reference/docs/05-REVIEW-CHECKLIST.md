# Pull/Merge Request Review Checklist

## Author checklist

- [ ] Ticket scope is understood and only intended files changed.
- [ ] Branch name includes the ticket ID.
- [ ] No client names, internal URLs, credentials, tokens, customer data, reports, or session files are present.
- [ ] `git diff --staged` was reviewed before commit.
- [ ] No dead code, debug logs, unused imports, commented-out code, or `test.only` remains.
- [ ] Skips contain a reason and ticket/condition.
- [ ] No arbitrary `waitForTimeout` is used.
- [ ] Locators follow semantic priority.
- [ ] Tests are independent and safe in parallel.
- [ ] Mutating tests create unique data and clean up.
- [ ] Lint, type check, and relevant tests pass.
- [ ] Branch is rebased on the latest upstream target.
- [ ] PR/MR description includes summary, ticket, validation, and risk.

## Reviewer checklist

- [ ] Scenario validates a meaningful business outcome.
- [ ] Page objects contain implementation details; specs remain readable.
- [ ] Assertions are web-first and verify results, not implementation noise.
- [ ] Failure messages help diagnosis.
- [ ] Timeouts/retries do not hide product or synchronization defects.
- [ ] Environment variables are validated and secrets are protected.
- [ ] CI artifacts are useful and do not expose confidential information.
- [ ] Naming is consistent and clear.
- [ ] The change does not introduce duplicated helpers or overlapping tests.
- [ ] Documentation matches commands and repository structure.
