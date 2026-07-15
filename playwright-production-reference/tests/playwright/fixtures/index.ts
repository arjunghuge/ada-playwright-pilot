import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page.js';
import { ContentPage } from '../pages/content-page.js';
import { StatusReportPage } from '../pages/status-report-page.js';
import { SystemLogPage } from '../pages/system-log-page.js';
import { DashboardPage } from '../pages/dashboard-page.js';
import { ResponsiveOrdersPage } from '../pages/responsive-orders-page.js';

type AppFixtures = {
  loginPage: LoginPage;
  contentPage: ContentPage;
  statusReportPage: StatusReportPage;
  systemLogPage: SystemLogPage;
  dashboardPage: DashboardPage;
  responsiveOrdersPage: ResponsiveOrdersPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  contentPage: async ({ page }, use) => { await use(new ContentPage(page)); },
  statusReportPage: async ({ page }, use) => { await use(new StatusReportPage(page)); },
  systemLogPage: async ({ page }, use) => { await use(new SystemLogPage(page)); },
  dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page)); },
  responsiveOrdersPage: async ({ page }, use) => { await use(new ResponsiveOrdersPage(page)); },
});

export { expect } from '@playwright/test';
