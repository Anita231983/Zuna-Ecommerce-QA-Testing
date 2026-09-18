import { test as base } from '@playwright/test';

export type Fixtures = {
  uiBaseUrl: string;
};

export const test = base.extend<Fixtures>({
  uiBaseUrl: async ({}, use) => {
    await use(process.env.ZUNA_BASE_URL || 'https://zunadesigns.com');
  },
});

export { expect } from '@playwright/test';