import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load shared non-secret defaults first, then developer-specific overrides.
dotenv.config({ path: new URL('../../.env', import.meta.url) });
dotenv.config({ path: new URL('../../.env.local', import.meta.url), override: true });

const baseURL = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests',
  outputDir: '../reports/playwright/results',
  snapshotDir: './snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',

  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    [process.env.CI ? 'dot' : 'list'],
    ['html', { outputFolder: '../reports/playwright/html', open: 'never' }],
    ...(process.env.CI
      ? ([['junit', { outputFile: '../reports/playwright/results/junit.xml' }]] as const)
      : []),
  ],

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    ...(process.env.HTTP_AUTH_USERNAME && process.env.HTTP_AUTH_PASSWORD
      ? {
          httpCredentials: {
            username: process.env.HTTP_AUTH_USERNAME,
            password: process.env.HTTP_AUTH_PASSWORD,
          },
        }
      : {}),
  },

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
});
