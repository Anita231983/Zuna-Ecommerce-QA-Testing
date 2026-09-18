import { Page, expect } from '@playwright/test';

export default class StorePage {
  constructor(private page: Page) {}

  async navigateToStore(uiBaseUrl: string) {
    await this.page.goto(`${uiBaseUrl}/store`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openFirstProduct() {
    const product = this.page
      .locator('a[href^="/store/"]')
      .filter({ hasText: /Rs\./ })
      .first();

    await expect(product).toBeVisible({ timeout: 10000 });
    await product.click();

    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectVariantIfPresent() {
    const colorOption = this.page
      .locator('text=Color')
      .locator('xpath=following::button[1]');
    await colorOption
      .first()
      .click({ timeout: 5000 })
      .catch(() => console.log('No color option found/selectable.'));

    const sizeOption = this.page
      .locator('text=Size')
      .locator('xpath=following::button[1]');
    await sizeOption
      .first()
      .click({ timeout: 5000 })
      .catch(() => console.log('No size option found/selectable.'));
  }

  async addToBag() {
    const addToBagButton = this.page.getByRole('button', {
      name: /add to bag/i
    });

    await expect(addToBagButton).toBeVisible({ timeout: 10000 });
    await addToBagButton.click();
  }

  async verifyItemInBag() {
    await expect(
      this.page.getByRole('heading', { name: /shopping bag/i })
    ).toBeVisible({ timeout: 10000 });
  }
}