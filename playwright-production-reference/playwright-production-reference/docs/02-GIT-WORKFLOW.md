# Git, Fork, Branch, Rebase, and Pull/Merge Request Guide

> **Confidentiality:** Before pushing, verify that the diff contains no credentials, internal URLs, customer data, screenshots, reports, `.env` files, or copied proprietary code unrelated to the task.

## 1. Confirm access before starting

- Open the upstream repository in GitHub or GitLab.
- Confirm you can view the code, issues/tickets, CI pipelines, and branch protection rules.
- Confirm SSH or HTTPS authentication works.
- Confirm the expected target branch, usually `develop` or `main`.
- Read `CONTRIBUTING.md`, PR/MR templates, commit rules, and team-specific instructions.

```bash
ssh -T git@github.com
# or
ssh -T git@gitlab.com
```

## 2. Fork and clone

Create a fork in the UI, then clone your fork.

```bash
git clone git@github.com:YOUR_USERNAME/example-repository.git
cd example-repository

git remote rename origin fork
git remote add upstream git@github.com:CLIENT_OR_ORG/example-repository.git
git remote -v
```

Expected model:

- `fork`: your writable fork.
- `upstream`: the protected source repository.

## 3. Start from a clean target branch

```bash
git fetch --all --prune
git switch develop
git reset --hard upstream/develop
git push fork develop --force-with-lease
```

Use `reset --hard` only after confirming that your local `develop` contains no personal work. Feature work must never be done directly on `develop`.

## 4. Create a ticket branch

Recommended pattern:

```text
TICKET-123-short-description
```

```bash
git switch -c TICKET-123-add-login-validation upstream/develop
```

Keep names lowercase after the ticket ID, use hyphens, and describe one purpose.

## 5. Work in small verified steps

```bash
git status
git diff
npm run lint:e2e
npm run typecheck:e2e
npm run test:e2e -- --project=desktop-chromium
```

Do not commit dead code, commented-out experiments, generated reports, debug logs, credentials, arbitrary timeouts, unrelated formatting, or accidental lockfile changes.

## 6. Stage intentionally

Prefer specific paths over blind staging:

```bash
git add tests/playwright/pages/login-page.ts
git add tests/playwright/tests/auth/login.spec.ts
git status
git diff --staged
```

`git add .` is allowed only after reviewing `git status` and then reviewing `git diff --staged`.

Remove an accidentally staged file:

```bash
git restore --staged path/to/file
```

Discard an unwanted local change:

```bash
git restore path/to/file
```

## 7. Commit rules

Recommended Conventional Commit format:

```text
type(scope): concise imperative summary
```

Examples:

```bash
git commit -m "test(auth): add invalid login coverage"
git commit -m "fix(playwright): use stable login locator"
git commit -m "docs(git): add fork and rebase workflow"
git commit -m "refactor(content): extract reusable page actions"
```

Common types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`, `ci`.

A good commit:

- Represents one logical change.
- Builds and passes relevant tests.
- Has no secrets or generated artifacts.
- Has a clear imperative summary.
- Avoids vague messages such as `changes`, `fix`, `updates`, or `final`.

## 8. Rebase before requesting review

```bash
git fetch upstream
git rebase upstream/develop
```

When conflicts occur:

```bash
git status
# Open each conflicted file and resolve markers:
# <<<<<<<, =======, >>>>>>>

git add path/to/resolved-file
git rebase --continue
```

Useful exits:

```bash
git rebase --abort   # Return to state before rebase
git rebase --skip    # Rare; skips the conflicting commit entirely
```

Never use `--skip` unless you understand that the commit's changes will be lost.

After a successful rebase:

```bash
git push fork HEAD --force-with-lease
```

Use `--force-with-lease`, not `--force`. It protects against overwriting remote commits you have not seen.

## 9. Create the PR/MR

Push the branch if not already pushed:

```bash
git push -u fork TICKET-123-add-login-validation
```

In GitHub or GitLab:

1. Open the upstream repository.
2. Create a Pull Request or Merge Request from your fork branch.
3. Confirm source and target branches carefully.
4. Add the ticket ID and clear summary.
5. Explain what changed, why, how it was tested, risks, and screenshots only when approved and free of private data.
6. Link the ticket.
7. Assign/request a peer reviewer.
8. Do not request final technical-architect review until peer comments and CI failures are resolved.

Suggested PR/MR body:

```text
## Summary
- Added ...
- Refactored ...

## Ticket
TICKET-123

## Validation
- [x] Lint passed
- [x] Type check passed
- [x] Relevant Playwright tests passed
- [x] No credentials, reports, or unrelated files included

## Risk
Low/Medium/High — explain why.
```

## 10. Ticket updates

Suggested comment:

```text
Implementation is complete and the PR/MR is ready for peer review: <link>.
Validation completed: lint, type check, and relevant automated tests.
```

Typical flow:

```text
In Progress → Peer Review → Changes Requested/Ready for TA Review → QA/UAT → Done
```

Use the exact workflow configured by the team; do not invent statuses.

## 11. Responding to review

- Reply to every material comment.
- Make focused changes; do not mix unrelated cleanup.
- Re-run relevant checks.
- Push updates to the same branch.
- Resolve conversations only after the requested change is present or agreement is recorded.
- Re-request review after meaningful updates.

## 12. Common recovery commands

```bash
# See history clearly
git log --oneline --graph --decorate --all -20

# Save unfinished work temporarily
git stash push -m "TICKET-123 work in progress"
git stash pop

# Undo last local commit but keep changes staged
git reset --soft HEAD~1

# Amend latest commit before review
git commit --amend

# Find the commit that introduced a regression
git bisect start
```
