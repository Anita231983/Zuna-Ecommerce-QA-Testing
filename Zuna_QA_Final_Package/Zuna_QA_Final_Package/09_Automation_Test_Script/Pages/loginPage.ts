import { Page, expect } from '@playwright/test';

export default class LoginPage {
  constructor(private page: Page) {}

  async navigateToZuna(uiBaseUrl: string) {
    await this.page.goto(uiBaseUrl);

    const accountLink = this.page.getByText(/account/i).first();
    const isDirectlyVisible = await accountLink.isVisible({ timeout: 3000 }).catch(() => false);

    if (isDirectlyVisible) {
      await accountLink.click();
      return;
    }

    
    console.log('Account link not directly visible — opening mobile menu.');

    const menuButton = this.page.getByRole('button').first(); // hamburger toggle is the first nav button
    await menuButton.click();
    await this.page.waitForTimeout(500);

    const loginLink = this.page.getByRole('link', { name: /^log in$/i });
    const hasLoginLink = await loginLink.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasLoginLink) {
      console.log('Found "Log in" link inside mobile menu — clicking it.');
      await loginLink.click();
      return;
    }

    // Fallback: menu might show "Account" after all (e.g. already logged in)
    const isVisibleAfterMenu = await accountLink.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisibleAfterMenu) {
      await accountLink.click();
      return;
    }

    await this.page.screenshot({ path: 'debug-mobile-menu.png', fullPage: true });
    throw new Error('Neither "Account" nor "Log in" found in mobile menu — see debug-mobile-menu.png');
  }

  async loginToZuna(email: string, password: string) {
    await this.page.getByPlaceholder(/email/i).fill(email);
    await this.page.locator('input[type="password"]').fill(password);
    await this.page.getByRole('button', { name: /login|sign in/i }).click();
  }

  async verifyLoginSuccess() {
    await expect(this.page.getByText(/account/i).first()).toBeVisible({ timeout: 10000 });
  }
}