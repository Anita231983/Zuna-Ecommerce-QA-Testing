import { expect, test } from '../fixtures/fixtures';
import LoginPage from '../Pages/loginPage';
import StorePage from '../Pages/storePage';
import CheckoutPage from '../Pages/checkoutPage';

test.describe('Zuna Core Customer Flow', () => {
  test('Login -> Add to Bag -> Checkout (Cash on Delivery)', async ({ uiBaseUrl, page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const storePage = new StorePage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step('Login with valid credentials', async () => {
      await loginPage.navigateToZuna(uiBaseUrl);
      await loginPage.loginToZuna(process.env.ZUNA_EMAIL!, process.env.ZUNA_PASSWORD!);
      await loginPage.verifyLoginSuccess();
    });

    await test.step('Add product to bag', async () => {
      await storePage.navigateToStore(uiBaseUrl);
      await storePage.openFirstProduct();
      await storePage.selectVariantIfPresent();
      await storePage.addToBag();
      await storePage.verifyItemInBag();
    });

    await test.step('Checkout via Cash on Delivery', async () => {
      await checkoutPage.navigateToCheckout(uiBaseUrl);
      await checkoutPage.fillContactInformation('Test User', '9801234567', 'testuser@example.com');
      await checkoutPage.addDeliveryAddress();
      await checkoutPage.selectCashOnDelivery();
      await checkoutPage.placeOrder();
      await checkoutPage.verifyOrderConfirmation();
    });
  });
});