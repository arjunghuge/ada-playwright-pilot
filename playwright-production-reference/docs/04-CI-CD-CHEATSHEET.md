# GitHub Actions and CI/CD Cheat Sheet

> **Confidentiality:** Store secrets in the CI platform's encrypted secret store. Never print secrets, copy them into YAML, or upload session files as artifacts.

## What CI/CD means

- **Continuous Integration (CI):** automatically validates each push or PR/MR using installation, lint, type checking, tests, and build steps.
- **Continuous Delivery/Deployment (CD):** promotes a validated change to an environment, either with approval or automatically.
- **Pipeline:** ordered jobs and steps executed by a CI runner.
- **Runner/agent:** machine that executes pipeline commands.
- **Artifact:** retained output such as reports, screenshots, traces, or build packages.
- **Secret:** protected runtime value such as a password or token.

## Recommended PR/MR pipeline

```text
Checkout → Install dependencies → Lint → Type check → Start/verify app → Install browser → Run tests → Upload report
```

## GitHub Actions

The sample `.github/workflows/playwright.yml` runs on pushes and pull requests targeting `main` or `develop`. It uses repository secrets for credentials and uploads reports even when tests fail.

Configure in GitHub:

```text
Repository → Settings → Secrets and variables → Actions
```

Use **Secrets** for passwords/tokens and **Variables** for non-sensitive expected versions or feature flags.

## GitLab CI

Copy `.gitlab-ci.example.yml` to `.gitlab-ci.yml` only after adapting it to the project's approved image, variables, stages, and runner rules. Merge-request pipelines should use `rules` for `merge_request_event` when that is the team's desired behavior.

Configure values in:

```text
Project → Settings → CI/CD → Variables
```

Mark sensitive variables masked and protected when appropriate.

## CI safety for forks

Forked PR/MR code is untrusted. Do not expose protected secrets to arbitrary fork pipelines. Review workflow changes before running them with privileged secrets or parent-project runners.

## Why CI may differ from local

- Different Node/browser versions.
- Missing environment variables.
- Smaller CPU or memory.
- Different test data or permissions.
- Headless rendering differences.
- Application startup race.
- Parallel workers sharing state.
- Timezone, locale, or network differences.

Fix the environmental contract instead of increasing every timeout.

## Pipeline debugging

1. Identify the first failed step, not the last visible error.
2. Read the test trace, screenshot, video, console, and network logs.
3. Confirm CI variables exist without printing their values.
4. Reproduce with the same command and browser project locally.
5. Confirm the application was ready before tests started.
6. Check whether the failure is test logic, environment, data, or product behavior.
7. Re-run only after making a reasoned change.

## Branch protection recommendations

- Require PR/MR review.
- Require CI status checks.
- Block direct pushes to protected branches.
- Block force pushes to protected branches.
- Require resolved conversations.
- Require branches to be current with the target branch when the team uses that policy.
- Restrict who can approve or deploy.

## Fast suite versus full suite

Use a fast smoke suite for every PR/MR. Run broader regression across browsers on scheduled or pre-release pipelines. Shard large suites only after ensuring tests are independent and data-safe.
