import { Page, expect } from '@playwright/test';

export default class CheckoutPage {
  constructor(private page: Page) {}

  async navigateToCheckout(uiBaseUrl: string) {
    const bagButton = this.page.getByRole('button', { name: /^\d+\s*(bag)?$/i });
    await expect(bagButton).toBeVisible({ timeout: 10000 });

    const checkoutLink = this.page.getByRole('link', { name: /^checkout$/i });

    for (let attempt = 0; attempt < 3; attempt++) {
      await bagButton.click();
      await this.page.waitForTimeout(800);
      const isOpen = await checkoutLink.isVisible().catch(() => false);
      if (isOpen) break;
    }

    await expect(checkoutLink).toBeVisible({ timeout: 10000 });
    await checkoutLink.click({ timeout: 10000 }).catch(async () => {
      await checkoutLink.click({ force: true });
    });

    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillContactInformation(fullName: string, phone: string, email: string) {
    await this.page.getByLabel(/full name/i).fill(fullName);

    // NOTE: the site's markup has a bug — both "Phone Number" and
    // "Secondary Phone (Optional)" inputs share name="phone", so we must
    // scope to .first() to hit the primary field (it appears first in the DOM).
    //
    // The field already comes pre-filled with a "+977 " prefix baked into the
    // text itself. Using .fill() to set the whole string at once breaks the
    // field's internal formatting/masking logic (digits get silently dropped).
    // Instead, click into the field, move the cursor to the end, and type
    // only the local digits as real keystrokes.
    const phoneInput = this.page.locator('input[name="phone"]').first();
    await phoneInput.click();
    await phoneInput.press('End');
    await phoneInput.pressSequentially(phone, { delay: 60 });

    const finalValue = await phoneInput.inputValue();
    console.log('Final phone field value:', finalValue);

    await this.page.getByLabel(/^email$/i).fill(email);
  }

  async addDeliveryAddress() {
    await this.page.waitForTimeout(1500);

    const addAddressButton = this.page.getByRole('button', { name: /add delivery address/i });
    const hasAddButton = await addAddressButton.isVisible({ timeout: 8000 }).catch(() => false);

    if (!hasAddButton) {
      console.log('Add address button not found, skipping address step.');
      return;
    }

    await addAddressButton.click();

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

    // Helper for these searchable dropdown comboboxes (Province / City / Area).
    // Each trigger has an accessible name (e.g. "Province"), and clicking it
    // opens a listbox of role="option" items.
    const selectFromDropdown = async (triggerName: RegExp, optionName: RegExp) => {
      const trigger = dialog.getByRole('button', { name: triggerName });
      const triggerVisible = await trigger.isVisible({ timeout: 3000 }).catch(() => false);
      if (!triggerVisible) {
        console.log(`Dropdown trigger not found for: ${triggerName}`);
        return false;
      }

      await trigger.click();
      const option = this.page.getByRole('option', { name: optionName }).first();
      const optionVisible = await option.isVisible({ timeout: 3000 }).catch(() => false);

      if (!optionVisible) {
        console.log(`No option found matching ${optionName} in ${triggerName}`);
        return false;
      }

      await option.click();
      await this.page.waitForTimeout(1200); // let dependent dropdowns (City/Area) repopulate
      return true;
    };

    // 1. Province
    await selectFromDropdown(/^province$/i, /bagmati/i);

    // 2. City — options depend on Province, so select whatever the FIRST real option is
    const cityTrigger = dialog.getByRole('button', { name: /^city$/i });
    if (await cityTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cityTrigger.click();
      const firstCityOption = this.page.getByRole('option').first();
      await firstCityOption.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
      const cityText = await firstCityOption.textContent().catch(() => '(none)');
      console.log('Selecting city:', cityText);
      await firstCityOption.click();
      await this.page.waitForTimeout(1200);
    } else {
      console.log('City dropdown trigger not found.');
    }

    // 3. Area — same pattern, depends on City
    const areaTrigger = dialog.getByRole('button', { name: /^area$/i });
    if (await areaTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await areaTrigger.click();
      const firstAreaOption = this.page.getByRole('option').first();
      await firstAreaOption.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
      const areaText = await firstAreaOption.textContent().catch(() => '(none)');
      console.log('Selecting area:', areaText);
      await firstAreaOption.click();
      await this.page.waitForTimeout(1200);
    } else {
      console.log('Area dropdown trigger not found.');
    }

    // Target the Address and Landmark fields directly by their placeholder text,
    // rather than relying on input[type="text"] — the Address field's actual
    // DOM structure doesn't reliably match that generic selector, which was
    // silently causing Address to stay empty while Landmark got filled instead.
    const addressInput = dialog.getByPlaceholder(/house number and street name/i);
    const addressVisible = await addressInput.isVisible({ timeout: 3000 }).catch(() => false);
    if (addressVisible) {
      await addressInput.fill('123 Test Street');
      await addressInput.press('Tab').catch(() => null);
      console.log('Address field filled: 123 Test Street');
    } else {
      console.log('WARNING: Address input (placeholder "House number and street name") not found.');
    }

    await dialog.getByPlaceholder(/additional info/i).fill('Near Test Landmark').catch(() => null);

    // Verify Address actually has a value right before Submit — this is the
    // exact field that was silently failing validation before.
    const addressValue = await addressInput.inputValue().catch(() => '');
    if (!addressValue) {
      console.log('WARNING: Address field is empty right before Submit — form will likely fail validation.');
    }

    const submitButton = dialog.getByRole('button', { name: /^submit$/i });

    // Confirm the button is actually enabled before clicking — if it's still
    // disabled, even a forced click will not fire a real submit, and the
    // dialog will never close. Log + screenshot so this is diagnosable.
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    if (isDisabled) {
      console.log('WARNING: Submit button is disabled before click — a required field may not be registering.');
      await this.page.screenshot({ path: 'test-results/debug-submit-disabled.png', fullPage: true }).catch(() => null);
    }

    await submitButton.click();

    // Wait for the dialog to actually close before moving on — on some
    // viewports (e.g. Mobile Safari) it can stay open/overlapping and
    // intercept clicks on later steps (like selecting Cash on Delivery).
    await dialog.waitFor({ state: 'hidden', timeout: 8000 }).catch(async () => {
      console.log('WARNING: Address dialog did not close after Submit.');
      await this.page.screenshot({ path: 'test-results/debug-dialog-stuck.png', fullPage: true }).catch(() => null);
      // Fallback: force-close via Escape if it's still open.
      await this.page.keyboard.press('Escape').catch(() => null);
      await this.page.waitForTimeout(500);
    });
  }

  async selectCashOnDelivery() {
    const codOption = this.page.getByText(/cash on delivery/i).first();
    await codOption.waitFor({ state: 'visible', timeout: 10000 });
    await codOption.click({ timeout: 10000 }).catch(async () => {
      // If something is still overlapping (stuck dialog), force the click.
      await codOption.click({ force: true });
    });
  }

  async placeOrder() {
    await this.page.getByRole('button', { name: /place order|confirm order/i }).click();
  }

  async verifyOrderConfirmation() {
    // The site requires SMS OTP verification before an order is fully confirmed.
    // Automated tests cannot receive/enter a real OTP, so the furthest verifiable
    // point end-to-end is confirming the OTP dialog appears (i.e. the order was
    // submitted and the app correctly moved to the verification step).
    const otpDialog = this.page.getByText(/verify your details|otp has been sent|confirm code/i).first();
    await expect(otpDialog).toBeVisible({ timeout: 15000 });
  }
}