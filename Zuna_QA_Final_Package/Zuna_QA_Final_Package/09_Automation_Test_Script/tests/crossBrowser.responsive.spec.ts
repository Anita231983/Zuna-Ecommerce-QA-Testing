import { expect, test } from '../fixtures/fixtures';
import LoginPage from '../Pages/loginPage';
import StorePage from '../Pages/storePage';
import CheckoutPage from '../Pages/checkoutPage';

test.describe('Cross-Browser & Responsive Check', () => {
  test('Store, product, and checkout pages render correctly', async ({ uiBaseUrl, page }, testInfo) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const storePage = new StorePage(page);
    const checkoutPage = new CheckoutPage(page);

    const browserName = testInfo.project.name.replace(/\s+/g, '-').toLowerCase();

    await test.step('Login', async () => {
      await loginPage.navigateToZuna(uiBaseUrl);
      await loginPage.loginToZuna(process.env.ZUNA_EMAIL!, process.env.ZUNA_PASSWORD!);
      await loginPage.verifyLoginSuccess();
      await page.screenshot({
        path: `test-results/responsive/${browserName}-01-login.png`,
        fullPage: true,
      });
    });

    await test.step('Store page', async () => {
      await storePage.navigateToStore(uiBaseUrl);
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `test-results/responsive/${browserName}-02-store.png`,
        fullPage: true,
      });
    });

    await test.step('Product page', async () => {
      await storePage.openFirstProduct();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `test-results/responsive/${browserName}-03-product.png`,
        fullPage: true,
      });
    });

    await test.step('Add to bag and view bag', async () => {
      await storePage.selectVariantIfPresent();
      await storePage.addToBag();
      await storePage.verifyItemInBag();
      await page.screenshot({
        path: `test-results/responsive/${browserName}-04-bag.png`,
        fullPage: true,
      });
    });

    await test.step('Checkout page layout', async () => {
      await checkoutPage.navigateToCheckout(uiBaseUrl);
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `test-results/responsive/${browserName}-05-checkout.png`,
        fullPage: true,
      });
    });

    console.log(
      `Completed responsive check for project: ${testInfo.project.name}, viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`
    );
  });
});