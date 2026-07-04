import { test, expect, Page } from '@playwright/test';

// ============================================================================
// SIMPLE POPUP HANDLING EXAMPLES - For Teaching
// ============================================================================
// These are simple, copy-paste ready examples for students

// ============================================================================
// SETUP: Dialog Handlers
// ============================================================================

class SimplePopupHandler {
  constructor(private page: Page) {}

  // Auto-accept all dialogs (useful for login flows)
  setupAutoAccept() {
    this.page.on('dialog', async (dialog) => {
      console.log('✅ Auto-accepting:', dialog.type(), '-', dialog.message());
      await dialog.accept();
    });
  }

  // Stop auto-accepting
  stopAutoAccept() {
    this.page.removeAllListeners('dialog');
  }

  // Setup to auto-dismiss (click NO)
  setupAutoDismiss() {
    this.page.on('dialog', async (dialog) => {
      console.log('❌ Auto-dismissing:', dialog.message());
      await dialog.dismiss();
    });
  }
}

// ============================================================================
// PRACTICAL TEACHING EXAMPLES
// ============================================================================

test.describe('🪟 Simple Popup Examples for Teaching', () => {

  // ========================================================================
  // EXAMPLE 1: Basic Alert Handling
  // ========================================================================
  test('Example 1: Handle a simple alert', async ({ page }) => {
    console.log('\n========== EXAMPLE 1: Alert Handling ==========\n');

    // TEACHING: Step 1 - Setup the listener
    console.log('Step 1: Setting up alert listener...');
    page.once('dialog', async (dialog) => {
      console.log('   Dialog type:', dialog.type());
      console.log('   Dialog message:', dialog.message());
      
      // TEACHING: Step 2 - Accept the alert
      console.log('   → Clicking OK button');
      await dialog.accept();
    });

    // TEACHING: Step 3 - Trigger something that shows alert
    // In a real test, this would be your web page action
    // await page.click('button-that-shows-alert');

    console.log('Step 2: Alert would be handled automatically\n');
    console.log('KEY LEARNING: Always listen BEFORE the action!\n');
  });

  // ========================================================================
  // EXAMPLE 2: Confirm Handling (Yes/No)
  // ========================================================================
  test('Example 2: Handle confirm dialog', async ({ page }) => {
    console.log('\n========== EXAMPLE 2: Confirm Handling ==========\n');

    page.once('dialog', async (dialog) => {
      // TEACHING: Check what the dialog is asking
      const message = dialog.message();
      console.log('Dialog asking:', message);

      // TEACHING: Different response based on context
      if (message.includes('delete')) {
        console.log('→ This is asking to delete, clicking YES');
        await dialog.accept();
      } else if (message.includes('cancel')) {
        console.log('→ This is asking to cancel, clicking NO');
        await dialog.dismiss();
      }
    });

    console.log('Confirm dialogs are like questions - we decide YES or NO\n');
  });

  // ========================================================================
  // EXAMPLE 3: Prompt Handling (Text input)
  // ========================================================================
  test('Example 3: Handle prompt dialog', async ({ page }) => {
    console.log('\n========== EXAMPLE 3: Prompt Handling ==========\n');

    page.once('dialog', async (dialog) => {
      console.log('Dialog type:', dialog.type());
      console.log('Question:', dialog.message());

      // TEACHING: Provide answer
      const answer = 'John Doe';
      console.log('→ Typing answer:', answer);
      await dialog.accept(answer);
    });

    console.log('Prompts ask for text input - we provide the answer\n');
  });

  // ========================================================================
  // EXAMPLE 4: Handle Multiple Dialogs in Sequence
  // ========================================================================
  test('Example 4: Handle multiple dialogs', async ({ page }) => {
    console.log('\n========== EXAMPLE 4: Multiple Dialogs ==========\n');

    let dialogCount = 0;

    // TEACHING: Use page.on() instead of page.once() for multiple
    page.on('dialog', async (dialog) => {
      dialogCount++;
      console.log(`\nDialog #${dialogCount}`);
      console.log('  Type:', dialog.type());
      console.log('  Message:', dialog.message());

      // TEACHING: Handle each type
      if (dialog.type() === 'alert') {
        console.log('  → This is an ALERT, clicking OK');
        await dialog.accept();
      } else if (dialog.type() === 'confirm') {
        console.log('  → This is a CONFIRM, clicking YES');
        await dialog.accept();
      } else if (dialog.type() === 'prompt') {
        console.log('  → This is a PROMPT, typing response');
        await dialog.accept('response');
      }
    });

    // TEACHING: Say what's happening
    console.log('Now if 3 dialogs appeared, they would all be handled');
    console.log('Simulate: Dialog 1 (alert), Dialog 2 (confirm), Dialog 3 (prompt)\n');

    // In real test you'd trigger actions here
    // await page.click('button1');
    // await page.click('button2');
    // await page.click('button3');

    // TEACHING: Clean up
    page.removeAllListeners('dialog');
    console.log(`\nTotal dialogs handled: ${dialogCount}\n`);
  });

  // ========================================================================
  // EXAMPLE 5: New Tab/Window Handling
  // ========================================================================
  test('Example 5: Handle new tab/window', async ({ browser }) => {
    console.log('\n========== EXAMPLE 5: New Tab Handling ==========\n');

    const page = await browser.newPage();

    console.log('Scenario: User clicks link that opens in new tab');
    console.log('TEACHING: We need to catch the new tab\n');

    // TEACHING: Use Promise.all to wait and trigger together
    console.log('Step 1: Listen for new page/tab...');
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'), // Listen
      // page.getByRole('link', { name: 'Open' }).click() // Trigger
    ]).catch(() => [null]);

    if (newPage) {
      console.log('Step 2: New tab captured!');
      console.log('   URL:', newPage.url());
      console.log('   Now you can interact with it');
      await newPage.close();
    }

    console.log('Step 3: New tab closed\n');
    await page.close();
  });

  // ========================================================================
  // EXAMPLE 6: Cookie Banner Dismissal (Real Pattern)
  // ========================================================================
  test('Example 6: Dismiss cookie banner', async ({ page }) => {
    console.log('\n========== EXAMPLE 6: Cookie Banner ==========\n');

    console.log('Many websites show cookie banners');
    console.log('Pattern: Check if visible → Click accept\n');

    // TEACHING: Try to find cookie banner
    const cookieBanner = page.locator('[id*="cookie"]');

    console.log('Step 1: Looking for cookie banner...');

    // TEACHING: Check if it exists with timeout
    const isVisible = await cookieBanner
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isVisible) {
      console.log('Step 2: Cookie banner found!');
      console.log('Step 3: Clicking "Accept" button...');

      await page
        .getByRole('button', { name: /accept|agree|continue/i })
        .click()
        .catch(() => {
          console.log('No accept button found');
        });

      console.log('Step 4: Cookie banner dismissed\n');
    } else {
      console.log('Step 2: No cookie banner - good!\n');
    }
  });

  // ========================================================================
  // EXAMPLE 7: Combine Multiple Popup Types
  // ========================================================================
  test('Example 7: Full workflow with multiple popups', async ({ page }) => {
    console.log('\n========== EXAMPLE 7: Complete Workflow ==========\n');

    // TEACHING: Auto-setup popup handling before starting
    console.log('SETUP: Auto-handling all popups...\n');

    page.on('dialog', async (dialog) => {
      console.log(`[POPUP] ${dialog.type()}: ${dialog.message()}`);
      
      // Respond based on type
      if (dialog.type() === 'alert' || dialog.type() === 'confirm') {
        await dialog.accept();
      } else if (dialog.type() === 'prompt') {
        await dialog.accept('AutoResponse');
      }
    });

    // TEACHING: Simulate workflow
    console.log('WORKFLOW:');
    console.log('1. User navigates to page');
    console.log('   → Alert appears: "Welcome!"');
    console.log('   → Auto-handled ✅');

    console.log('2. User adds item to cart');
    console.log('   → Confirm appears: "Add to cart?"');
    console.log('   → Auto-handled ✅');

    console.log('3. User clicks checkout');
    console.log('   → Prompt appears: "Enter coupon code"');
    console.log('   → Auto-handled ✅\n');

    console.log('WITHOUT popup handling, test would TIMEOUT ⏸️');
    console.log('WITH popup handling, test runs smoothly ✅\n');

    page.removeAllListeners('dialog');
  });

  // ========================================================================
  // EXAMPLE 8: Real E-Commerce Login Scenario
  // ========================================================================
  test('Example 8: E-commerce login with popup', async ({ page }) => {
    console.log('\n========== EXAMPLE 8: E-Commerce Login ==========\n');

    // TEACHING: You're logging in to Swag Labs
    // Sometimes it shows alerts/confirmations

    console.log('Real scenario: Login to e-commerce site');
    console.log('Some sites show "Session expired" alert before login\n');

    // Auto-handle any popups
    let popupsHandled = 0;
    page.on('dialog', async (dialog) => {
      popupsHandled++;
      console.log(`  ✓ Popup #${popupsHandled} handled: ${dialog.message()}`);
      await dialog.accept();
    });

    try {
      console.log('Step 1: Navigating to Swag Labs...');
      await page.goto('https://www.saucedemo.com/', { timeout: 10000 });

      console.log('Step 2: Checking for any popups...');
      console.log('  (If any appeared, they were auto-handled)\n');

      console.log('Step 3: Filling login form...');
      await page.getByPlaceholder('Username').fill('standard_user');
      await page.getByPlaceholder('Password').fill('secret_sauce');

      console.log('Step 4: Clicking login...');
      await page.getByRole('button', { name: /login/i }).click();

      console.log('Step 5: Verifying login...\n');

      // Wait for products to load
      await page.waitForSelector('[data-testid="inventory-container"]', {
        timeout: 5000,
      });

      console.log('✅ LOGIN SUCCESSFUL!\n');
    } catch (error) {
      console.log('❌ Error:', error);
    } finally {
      console.log(`Total popups handled: ${popupsHandled}`);
      page.removeAllListeners('dialog');
    }
  });

  // ========================================================================
  // EXAMPLE 9: When to use page.once() vs page.on()
  // ========================================================================
  test('Example 9: page.once() vs page.on() explained', async () => {
    console.log('\n========== EXAMPLE 9: page.once vs page.on ==========\n');

    console.log('USE page.once() when:');
    console.log('  • You expect exactly ONE dialog');
    console.log('  • Dialog appears after a single action');
    console.log('  • Example: Delete button shows confirmation\n');

    console.log('CODE EXAMPLE (page.once):');
    console.log('  page.once("dialog", async (d) => await d.accept());');
    console.log('  await page.click("delete-btn"); // Shows 1 dialog\n');

    console.log('---\n');

    console.log('USE page.on() when:');
    console.log('  • You expect MULTIPLE dialogs');
    console.log('  • Multiple actions each trigger a dialog');
    console.log('  • Example: Multi-step form with confirmations\n');

    console.log('CODE EXAMPLE (page.on):');
    console.log('  page.on("dialog", async (d) => await d.accept());');
    console.log('  await page.click("step1-btn"); // Shows dialog 1');
    console.log('  await page.click("step2-btn"); // Shows dialog 2');
    console.log('  page.removeAllListeners("dialog"); // Stop listening\n');

    console.log('RULE OF THUMB:');
    console.log('  page.once() = Single popup scenario');
    console.log('  page.on() = Multi-popup scenario\n');
  });
});

// ============================================================================
// 🎓 TEACHING SUMMARY
// ============================================================================
//
// KEY POINTS TO TEACH:
//
// 1. "Setup BEFORE action"
//    ✓ page.once('dialog', ...) must be BEFORE click
//    ✗ Don't setup after clicking
//
// 2. "Multiple popups need page.on()"
//    ✓ page.on() catches all
//    ✗ page.once() only catches first
//
// 3. "Always cleanup"
//    ✓ page.removeAllListeners('dialog') when done
//    ✗ Don't leave listeners hanging
//
// 4. "Know the popup type"
//    • alert = just OK
//    • confirm = YES or NO
//    • prompt = type text
//
// 5. "Test hangs without popup handling"
//    ✓ With handling = test passes
//    ✗ Without handling = TIMEOUT
//
// ============================================================================
