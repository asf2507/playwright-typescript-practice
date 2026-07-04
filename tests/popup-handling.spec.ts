import { test, expect, Page } from '@playwright/test';

// ============================================================================
// POPUP HANDLING IN PLAYWRIGHT - Complete Guide
// ============================================================================
//
// What are Popups?
// 1. JavaScript Alerts/Dialogs (alert, confirm, prompt)
// 2. New Windows/Tabs
// 3. Modal Dialogs
// 4. Cookie Consent Banners
// 5. Notification Popups
//
// ============================================================================

// ============================================================================
// PART 1: JAVASCRIPT DIALOGS (Alert, Confirm, Prompt)
// ============================================================================

class DialogHandler {
  constructor(private page: Page) {}

  // ✅ HANDLE ALERT (Just shows message)
  // Example: "Your item was added to cart!"
  async handleAlert() {
    // Listen for dialog BEFORE it appears
    // This must be set up before the action that triggers the dialog!
    this.page.once('dialog', async (dialog) => {
      console.log('🚨 Alert popup detected:', dialog.message());
      
      // Accept the alert (click OK)
      await dialog.accept();
    });

    // Now trigger the action that shows the alert
    // Example: click a button that shows alert
    await this.page.getByRole('button', { name: 'Show Alert' }).click();

    console.log('✅ Alert handled and dismissed');
  }

  // ✅ HANDLE CONFIRM (Yes/No question)
  // Example: "Are you sure you want to delete?"
  async handleConfirm(clickYes: boolean = true) {
    // Setup listener for confirm dialog
    this.page.once('dialog', async (dialog) => {
      console.log('❓ Confirm popup detected:', dialog.message());
      console.log('   Dialog type:', dialog.type());
      
      if (clickYes) {
        console.log('   → User clicks YES');
        await dialog.accept(); // Click OK/YES
      } else {
        console.log('   → User clicks NO');
        await dialog.dismiss(); // Click Cancel/NO
      }
    });

    // Trigger action that shows confirm
    await this.page.getByRole('button', { name: 'Delete Item' }).click();

    console.log('✅ Confirm dialog handled');
  }

  // ✅ HANDLE PROMPT (Text input dialog)
  // Example: "Enter your name"
  async handlePrompt(inputText: string) {
    // Setup listener for prompt dialog
    this.page.once('dialog', async (dialog) => {
      console.log('📝 Prompt dialog detected:', dialog.message());
      
      // Type the response
      await dialog.accept(inputText);
    });

    // Trigger action
    await this.page.getByRole('button', { name: 'Name Please' }).click();

    console.log('✅ Prompt handled with input:', inputText);
  }

  // ✅ HANDLE MULTIPLE DIALOGS
  // Example: First alert, then confirm
  async handleMultipleDialogs() {
    // Listen for ALL dialogs (not just first one)
    this.page.on('dialog', async (dialog) => {
      console.log('Dialog detected:', dialog.type(), '-', dialog.message());
      
      // Handle different types
      if (dialog.type() === 'alert') {
        await dialog.accept();
      } else if (dialog.type() === 'confirm') {
        await dialog.accept(); // Click YES
      } else if (dialog.type() === 'prompt') {
        await dialog.accept('John Doe');
      }
    });

    // Trigger multiple dialog actions
    await this.page.click('button.trigger-dialogs');

    // Stop listening (clean up)
    this.page.removeAllListeners('dialog');

    console.log('✅ All dialogs handled');
  }

  // ✅ REJECT DIALOG (Click Cancel)
  async rejectDialog() {
    this.page.once('dialog', async (dialog) => {
      console.log('🛑 Rejecting dialog:', dialog.message());
      await dialog.dismiss(); // Click CANCEL
    });

    await this.page.getByRole('button', { name: 'Logout' }).click();

    console.log('✅ Dialog dismissed');
  }

  // ✅ GET DIALOG TEXT (Check message before responding)
  async getDialogTextAndRespond() {
    this.page.once('dialog', async (dialog) => {
      const message = dialog.message();
      console.log('Dialog message:', message);
      
      // Different response based on message
      if (message.includes('confirm')) {
        await dialog.accept();
      } else if (message.includes('cancel')) {
        await dialog.dismiss();
      }
    });

    await this.page.click('button');
  }
}

// ============================================================================
// PART 2: NEW WINDOWS/TABS POPUPS
// ============================================================================

class WindowPopupHandler {
  constructor(private page: Page) {}

  // ✅ HANDLE NEW TAB/WINDOW
  async handleNewWindow() {
    // When clicking a link opens new tab, we need to wait for it
    console.log('📂 Waiting for new page/tab...');
    
    // Method 1: Use Promise.all to wait for new page
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'), // Listen for new page
      this.page.getByRole('link', { name: 'Open in new tab' }).click() // Trigger
    ]);

    console.log('✅ New tab opened. URL:', newPage.url());

    // Now you can interact with the new page
    await expect(newPage).toHaveTitle(/Google/);

    // Close the new tab
    await newPage.close();

    console.log('✅ New tab closed');
  }

  // ✅ HANDLE WINDOW.OPEN() POPUP
  async handleWindowOpenPopup() {
    // When JavaScript calls window.open(), we capture it
    console.log('🪟 Waiting for window.open() popup...');

    const [popup] = await Promise.all([
      this.page.context().waitForEvent('page'), // Wait for popup
      this.page.getByRole('button', { name: 'Open Popup' }).click() // Trigger
    ]);

    console.log('✅ Popup window opened. URL:', popup.url());

    // Interact with popup
    await popup.getByRole('heading').isVisible();

    // Close popup
    await popup.close();

    console.log('✅ Popup window closed');
  }

  // ✅ SWITCH TO NEW WINDOW
  async switchToNewWindow() {
    const newPagePromise = this.page.context().waitForEvent('page');
    
    // Click link that opens new window
    await this.page.getByRole('link', { name: 'Link' }).click();
    
    // Get the new page
    const newPage = await newPagePromise;
    
    // Do stuff on new page
    console.log('New page title:', await newPage.title());
    
    // Bring original page back into focus if needed
    console.log('Original page title:', await this.page.title());
  }

  // ✅ HANDLE MULTIPLE POPUPS
  async handleMultiplePopups() {
    const popups: Page[] = [];

    // Listen for all new pages
    this.page.context().on('page', (page) => {
      console.log('🪟 New popup detected:', page.url());
      popups.push(page);
    });

    // Trigger multiple popups
    await this.page.getByRole('button', { name: 'Open 3 Popups' }).click();

    // Wait a moment for all to open
    await this.page.waitForTimeout(2000);

    console.log(`✅ Total popups opened: ${popups.length}`);

    // Close all popups
    for (const popup of popups) {
      await popup.close();
    }

    console.log('✅ All popups closed');
  }
}

// ============================================================================
// PART 3: MODAL DIALOGS (HTML Popups)
// ============================================================================

class ModalHandler {
  constructor(private page: Page) {}

  // ✅ HANDLE HTML MODAL
  // Example: <div class="modal" role="dialog">...</div>
  async handleModal() {
    console.log('🪟 Modal dialog detected');

    // Wait for modal to be visible
    await this.page.waitForSelector('[role="dialog"]');

    // Interact with modal content
    await this.page.getByRole('heading', { name: 'Popup Title' }).isVisible();

    // Click modal button
    await this.page.getByRole('button', { name: 'Close' }).click();

    // Verify modal is gone
    await expect(this.page.locator('[role="dialog"]')).toBeHidden();

    console.log('✅ Modal closed');
  }

  // ✅ HANDLE MODAL WITH OVERLAY (click outside to close)
  async closeModalByOverlay() {
    // Click on the overlay/backdrop to close modal
    const overlay = this.page.locator('[class*="modal-overlay"]');
    
    if (await overlay.isVisible()) {
      console.log('Clicking overlay to close modal...');
      await overlay.click();
      
      // Verify modal closed
      await expect(this.page.locator('[role="dialog"]')).toBeHidden();
      console.log('✅ Modal closed via overlay');
    }
  }

  // ✅ HANDLE MODAL WITH FORM
  async fillModalForm(data: { name: string; email: string }) {
    // Wait for modal
    await this.page.waitForSelector('[role="dialog"]');

    // Fill form inside modal
    await this.page.getByLabel('Name').fill(data.name);
    await this.page.getByLabel('Email').fill(data.email);

    // Submit
    await this.page.getByRole('button', { name: 'Submit' }).click();

    // Verify modal closed after submit
    await expect(this.page.locator('[role="dialog"]')).toBeHidden();

    console.log('✅ Modal form submitted');
  }

  // ✅ HANDLE MODAL WITH MULTIPLE BUTTONS
  async handleModalButtons() {
    // Wait for modal
    await this.page.locator('[role="dialog"]').waitFor();

    // Get all buttons in modal
    const buttons = await this.page
      .locator('[role="dialog"] button')
      .allTextContents();

    console.log('Modal buttons:', buttons);

    // Click specific button
    await this.page
      .locator('[role="dialog"]')
      .getByRole('button', { name: 'Cancel' })
      .click();

    console.log('✅ Modal button clicked');
  }
}

// ============================================================================
// PART 4: NOTIFICATIONS & BANNERS (Non-blocking popups)
// ============================================================================

class NotificationHandler {
  constructor(private page: Page) {}

  // ✅ DISMISS COOKIE BANNER
  async dismissCookieBanner() {
    console.log('🍪 Looking for cookie banner...');

    // Check if banner exists
    const banner = this.page.locator('[id*="cookie"]');
    
    if (await banner.isVisible()) {
      console.log('✓ Cookie banner found');
      
      // Click accept button
      await this.page
        .getByRole('button', { name: /accept|agree/i })
        .click();
      
      console.log('✅ Cookie banner dismissed');
    } else {
      console.log('✓ No cookie banner found');
    }
  }

  // ✅ HANDLE NOTIFICATIONS (Toast messages)
  async dismissNotification() {
    // Wait for notification to appear
    await this.page.waitForSelector('[class*="toast"], [class*="notification"]');

    console.log('📢 Notification appeared');

    // Close notification (if close button exists)
    const closeBtn = this.page.locator('[class*="notification"] button');
    
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }

    // Or wait for it to auto-dismiss
    await this.page.waitForSelector(
      '[class*="notification"]',
      { state: 'hidden', timeout: 5000 }
    );

    console.log('✅ Notification dismissed');
  }

  // ✅ HANDLE ALERT BANNER
  async dismissAlertBanner() {
    const alertBanner = this.page.locator('[role="alert"]');

    if (await alertBanner.isVisible()) {
      console.log('⚠️ Alert banner found:', await alertBanner.textContent());
      
      // Click X button to close
      await alertBanner.locator('button').click();
      
      console.log('✅ Alert banner closed');
    }
  }
}

// ============================================================================
// TEACHING EXAMPLES & TESTS
// ============================================================================

test.describe('🪟 Popup Handling Examples', () => {

  // ========================================================================
  // EXAMPLE 1: HANDLE JAVASCRIPT ALERTS
  // ========================================================================
  test('✅ Handle JavaScript Alert Popup', async ({ page }) => {
    console.log('\n🚀 Test: Handling JavaScript Alert\n');

    // This is a demo - in real case, navigate to a page with alerts
    // For learning: use console to see the popup handling

    // Listen for alert before triggering it
    let alertMessage = '';
    page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      console.log('📢 Alert message:', alertMessage);
      
      // Accept (click OK)
      await dialog.accept();
    });

    // If you had a page with alert:
    // await page.goto('https://example.com');
    // await page.click('button-that-triggers-alert');

    console.log('✅ Alert would be handled automatically');
  });

  // ========================================================================
  // EXAMPLE 2: HANDLE CONFIRM DIALOG
  // ========================================================================
  test('✅ Handle Confirm Dialog (Yes/No)', async ({ page }) => {
    console.log('\n🚀 Test: Handling Confirm Dialog\n');

    let confirmedAction = false;

    page.once('dialog', async (dialog) => {
      console.log('Dialog type:', dialog.type());
      console.log('Message:', dialog.message());
      
      // Simulate user clicking YES
      confirmedAction = true;
      await dialog.accept();
    });

    // Trigger: await page.click('delete-button');

    expect(confirmedAction).toBe(true);
    console.log('✅ Confirm dialog handled - user clicked YES');
  });

  // ========================================================================
  // EXAMPLE 3: POPUP WINDOW HANDLING
  // ========================================================================
  test('✅ Handle Popup Window', async ({ browser }) => {
    console.log('\n🚀 Test: Handling Popup Window\n');

    const page = await browser.newPage();

    // When you click a link that opens new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      // This would trigger: page.click('link-that-opens-new-tab')
      // For demo, we'll just verify the mechanism works
    ]);

    console.log(
      '✅ New popup window would be captured and handled'
    );

    await page.close();
  });

  // ========================================================================
  // EXAMPLE 4: COOKIE BANNER DISMISSAL
  // ========================================================================
  test('✅ Dismiss Cookie Banner', async ({ page }) => {
    console.log('\n🚀 Test: Dismissing Cookie Banner\n');

    // Navigate to a site with cookie banner
    // For demo: await page.goto('https://example.com');

    // Check if cookie banner exists and dismiss it
    const cookieBanner = page.locator('[id*="cookie"]');

    if (await cookieBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('🍪 Cookie banner found - dismissing...');
      
      await page
        .getByRole('button', { name: /accept|agree/i })
        .click()
        .catch(() => {
          console.log('No cookie banner to dismiss');
        });

      console.log('✅ Cookie banner dismissed');
    } else {
      console.log('✓ No cookie banner present');
    }
  });

  // ========================================================================
  // EXAMPLE 5: HANDLE MULTIPLE POPUPS IN SEQUENCE
  // ========================================================================
  test('✅ Handle Multiple Popups', async ({ page }) => {
    console.log('\n🚀 Test: Handling Multiple Popups\n');

    let popupCount = 0;

    // Listen for all dialogs
    page.on('dialog', async (dialog) => {
      popupCount++;
      console.log(`📢 Popup #${popupCount}: ${dialog.type()}`);
      
      // Handle based on type
      if (dialog.type() === 'alert') {
        await dialog.accept();
      } else if (dialog.type() === 'confirm') {
        await dialog.accept();
      }
    });

    // Scenario: trigger actions that create popups
    // await page.click('button-multi-popups');

    // Stop listening
    page.removeAllListeners('dialog');

    console.log(`✅ Handled ${popupCount} popups`);
  });
});

// ============================================================================
// 🎓 TEACHING SUMMARY - Key Popup Types & Handling
// ============================================================================
//
// | Popup Type | How to Handle | Code |
// |-----------|---------------|------|
// | Alert | page.once('dialog', accept) | Accept only |
// | Confirm | page.once('dialog', accept/dismiss) | Yes or No |
// | Prompt | dialog.accept(text) | Type response |
// | New Tab | context.waitForEvent('page') | Capture & interact |
// | Modal | Wait selector, interact, close | Click buttons |
// | Toast | waitForSelector hidden state | Auto-dismiss or close |
// | Banner | findLocator, click close | Click button |
//
// ============================================================================
// 
// BEST PRACTICES:
// ✅ Setup listener BEFORE action triggers popup
// ✅ Use page.once() for single popup, page.on() for multiple
// ✅ Always clean up: page.removeAllListeners()
// ✅ Add timeouts to prevent hanging tests
// ✅ Log what's happening for debugging
//
// ============================================================================
