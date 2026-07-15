# Playwright Production Reference

> **Confidentiality:** This repository is a generic training reference. Never copy client names, credentials, production data, private URLs, screenshots, reports, session files, or proprietary selectors into a public repository or external tool.

A production-oriented Playwright + TypeScript structure for junior engineers, interns, QA engineers, and developers. It demonstrates page objects, typed fixtures, test data, responsive coverage, health checks, linting, type checking, and CI examples without containing any real project information.

## Start here

1. Read [`docs/01-FRAMEWORK-SETUP.md`](docs/01-FRAMEWORK-SETUP.md).
2. Copy `.env.example` to `.env.local` and add safe test-environment values.
3. Run `npm ci` and `npx playwright install chromium`.
4. Run `npm run test:e2e`.
5. Read the Git workflow before creating a branch: [`docs/02-GIT-WORKFLOW.md`](docs/02-GIT-WORKFLOW.md).

## Repository structure

```text
.
├── .github/workflows/playwright.yml
├── docs/
├── tests/playwright/
│   ├── fixtures/
│   ├── pages/
│   ├── tests/
│   │   ├── auth/
│   │   ├── content/
│   │   ├── dashboard/
│   │   ├── health-check/
│   │   └── responsive/
│   └── playwright.config.ts
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
└── tsconfig.json
```

## Documentation

- Framework setup and commands: [`docs/01-FRAMEWORK-SETUP.md`](docs/01-FRAMEWORK-SETUP.md)
- Fork, branch, rebase, commit, PR/MR workflow: [`docs/02-GIT-WORKFLOW.md`](docs/02-GIT-WORKFLOW.md)
- Automation engineering guide: [`docs/03-AUTOMATION-CHEATSHEET.md`](docs/03-AUTOMATION-CHEATSHEET.md)
- CI/CD and GitHub Actions: [`docs/04-CI-CD-CHEATSHEET.md`](docs/04-CI-CD-CHEATSHEET.md)
- Code review checklist: [`docs/05-REVIEW-CHECKLIST.md`](docs/05-REVIEW-CHECKLIST.md)

## Important comment rule

Detailed learning comments belong in documentation, not in production source code. Keep source comments only when they explain a non-obvious decision, business rule, workaround, or safety constraint. Remove comments that merely translate the code line-by-line.
