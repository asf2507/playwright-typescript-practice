# 🪟 POPUP HANDLING IN PLAYWRIGHT - Quick Reference

## **Why Handle Popups?**
Popups appear on most websites:
- ✅ JavaScript alerts ("Success!")
- ✅ Confirm dialogs ("Delete item?")
- ✅ Prompts ("Enter name...")
- ✅ New windows/tabs
- ✅ Modals
- ✅ Cookie banners
- ✅ Notifications

**Without handling popups, your tests will hang! ⏸️**

---

## **1. JAVASCRIPT DIALOGS - 30 seconds to master**

### **A. Handle Alert (Just OK button)**
```typescript
// LISTEN for alert BEFORE it happens
page.once('dialog', async (dialog) => {
  console.log('Alert:', dialog.message());
  await dialog.accept(); // Click OK
});

// THEN trigger the action
await page.click('button-that-shows-alert');
```

**Teaching Script:**
> "Alert is like a warning. We listen for it, then click OK."

---

### **B. Handle Confirm (Yes/No)**
```typescript
// Listen for confirm dialog
page.once('dialog', async (dialog) => {
  if (dialog.message().includes('delete')) {
    await dialog.accept();  // Click YES
  } else {
    await dialog.dismiss(); // Click NO
  }
});

// Trigger it
await page.click('delete-button');
```

**Teaching Example:**
```
Dialog: "Are you sure you want to delete?"
→ We click YES = dialog.accept()
→ We click NO = dialog.dismiss()
```

---

### **C. Handle Prompt (Text input)**
```typescript
// Listen for prompt
page.once('dialog', async (dialog) => {
  // Type response
  await dialog.accept('John Doe');
});

// Trigger it
await page.click('name-prompt-button');
```

**Real Example:**
```
Dialog: "What is your name?"
→ We type: "John Doe"
→ dialog.accept('John Doe')
```

---

### **D. Handle Multiple Dialogs**
```typescript
// Use page.on() instead of page.once()
page.on('dialog', async (dialog) => {
  console.log('Dialog:', dialog.type());
  if (dialog.type() === 'alert') {
    await dialog.accept();
  } else if (dialog.type() === 'confirm') {
    await dialog.accept();
  }
});

// Trigger multiple actions
await page.click('button1');
await page.click('button2');

// STOP listening when done
page.removeAllListeners('dialog');
```

---

### **E. Get Dialog Info Before Responding**
```typescript
page.once('dialog', async (dialog) => {
  const message = dialog.message(); // Get message
  const type = dialog.type();       // Get type
  
  console.log(`${type}: ${message}`);
  
  // Respond based on content
  if (message.includes('confirm')) {
    await dialog.accept();
  } else {
    await dialog.dismiss();
  }
});

await page.click('button');
```

---

## **2. NEW WINDOWS / TABS**

### **A. Handle Link Opening New Tab**
```typescript
// IMPORTANT: Setup before clicking
const [newPage] = await Promise.all([
  page.context().waitForEvent('page'), // Listen for new tab
  page.getByRole('link', { name: 'Open Link' }).click() // Trigger
]);

console.log('New tab URL:', newPage.url());

// Use the new page
await expect(newPage).toHaveTitle(/Expected Title/);

// Close it
await newPage.close();
```

**Teaching Script:**
> "When user clicks link that opens new tab, we:
>  1. Listen for new page (waitForEvent)
>  2. Click the link
>  3. Capture the new page
>  4. Do stuff on new page
>  5. Close it"

---

### **B. Handle window.open() Popup**
```typescript
// Same pattern as new tab
const [popup] = await Promise.all([
  page.context().waitForEvent('page'),
  page.getByRole('button', { name: 'Open Popup' }).click()
]);

// Interact with popup
await popup.getByRole('heading').isVisible();

// Close popup
await popup.close();
```

---

### **C. Handle Multiple New Tabs**
```typescript
const newPages = [];

// Listen for all new pages
page.context().on('page', (newPage) => {
  console.log('New tab:', newPage.url());
  newPages.push(newPage);
});

// Trigger multiple opens
await page.click('button-opens-3-tabs');

// Wait for all to load
await page.waitForTimeout(2000);

console.log(`Total tabs: ${newPages.length}`);

// Close all
for (const p of newPages) {
  await p.close();
}
```

---

## **3. HTML MODALS**

### **A. Simple Modal**
```typescript
// Wait for modal to appear
await page.waitForSelector('[role="dialog"]');

// Fill form if needed
await page.getByLabel('Name').fill('John');

// Click modal button
await page.getByRole('button', { name: 'Submit' }).click();

// Verify modal closed
await expect(page.locator('[role="dialog"]')).toBeHidden();
```

---

### **B. Close Modal by Clicking X**
```typescript
// Wait for modal
await page.locator('[role="dialog"]').waitFor();

// Click close button
await page.locator('[role="dialog"] button[aria-label="Close"]').click();

// Verify closed
await expect(page.locator('[role="dialog"]')).toBeHidden();
```

---

### **C. Close Modal by Clicking Overlay**
```typescript
// Click the overlay/backdrop
await page.locator('[class*="modal-overlay"]').click();

// Modal should close
await expect(page.locator('[role="dialog"]')).toBeHidden();
```

---

## **4. COOKIE BANNERS & NOTIFICATIONS**

### **A. Dismiss Cookie Banner**
```typescript
// Try to find and dismiss cookie banner
const cookieBanner = page.locator('[id*="cookie"]');

if (await cookieBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
  // Click accept button
  await page.getByRole('button', { name: /accept|agree/i }).click();
}
```

---

### **B. Dismiss Toast Notification**
```typescript
// Wait for notification to appear
await page.waitForSelector('[class*="toast"]');

// Click close button
await page.locator('[class*="toast"] button').click();

// Wait for it to disappear
await page.waitForSelector('[class*="toast"]', { state: 'hidden' });
```

---

### **C. Handle Alert Banner (Role Alert)**
```typescript
const alert = page.locator('[role="alert"]');

if (await alert.isVisible()) {
  console.log('Alert:', await alert.textContent());
  
  // Close it
  await alert.locator('button').click();
}
```

---

## **COMPLETE EXAMPLE: E-Commerce Checkout With Popups**

```typescript
test('Complete checkout with popup handling', async ({ page }) => {
  // Login
  await page.goto('https://example.com');
  await page.getByPlaceholder('Username').fill('user');
  await page.getByPlaceholder('Password').fill('pass');
  await page.click('button:has-text("Login")');

  // Dismiss any cookie banner
  const cookie = page.locator('[id*="cookie"]');
  if (await cookie.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.click('button:has-text("Accept")');
  }

  // Add product (might show confirmation)
  page.once('dialog', async (dialog) => {
    if (dialog.type() === 'confirm') {
      await dialog.accept(); // Yes, add to cart
    }
  });
  await page.click('add-to-cart-button');

  // Go to checkout
  await page.click('checkout-button');

  // Handle delivery options modal
  await page.waitForSelector('[role="dialog"]');
  await page.selectOption('select[name="delivery"]', 'standard');
  await page.click('modal-confirm-button');

  // Verify success
  await expect(page.getByText('Order Confirmed')).toBeVisible();
});
```

---

## **🎓 SUMMARY TABLE**

| Popup Type | Trigger | Code | Close |
|-----------|---------|------|-------|
| **Alert** | JavaScript | `page.once('dialog')` | `dialog.accept()` |
| **Confirm** | User choice | `page.once('dialog')` | `dialog.accept/dismiss()` |
| **Prompt** | Text input | `page.once('dialog')` | `dialog.accept(text)` |
| **New Tab** | Link click | `context.waitForEvent('page')` | `newPage.close()` |
| **Modal** | HTML element | `waitForSelector()` | `click button` |
| **Cookie** | Auto-load | `locator().isVisible()` | `click button` |
| **Toast** | User action | `waitForSelector()` | `auto or click` |

---

## **⚠️ COMMON MISTAKES**

### ❌ WRONG: Setup listener AFTER clicking
```typescript
await page.click('button-shows-alert'); // Dialog already gone!
page.once('dialog', async (dialog) => {
  await dialog.accept(); // Too late!
});
```

### ✅ RIGHT: Setup BEFORE clicking
```typescript
page.once('dialog', async (dialog) => {
  await dialog.accept();
});
await page.click('button-shows-alert'); // Dialog caught!
```

---

### ❌ WRONG: Not handling multiple popups
```typescript
page.once('dialog', async (dialog) => {
  await dialog.accept(); // Only catches first!
});
```

### ✅ RIGHT: Use page.on() for multiple
```typescript
page.on('dialog', async (dialog) => {
  await dialog.accept(); // Catches all!
});
// ... cleanup at end:
page.removeAllListeners('dialog');
```

---

### ❌ WRONG: Test hangs on unexpected popup
```typescript
// If popup appears and we don't handle it, test times out
await page.click('button');
// Dialog appears but nothing happens → TIMEOUT
```

### ✅ RIGHT: Always expect popups
```typescript
page.once('dialog', async (d) => await d.accept());
await page.click('button');
// Popup handled automatically
```

---

## **🚀 TEACHING TIP: Let Students See It Fail**

### Step 1: Show failing test
```typescript
test('will timeout without popup handling', async ({ page }) => {
  await page.goto('https://example.com');
  await page.click('button-shows-alert');
  // Test hangs here! ⏸️
});
```

### Step 2: Show it timeout
```
Error: Timeout 30000ms exceeded waiting for navigation
```

### Step 3: Add popup handling
```typescript
test('works with popup handling', async ({ page }) => {
  page.once('dialog', async (d) => await d.accept());
  await page.goto('https://example.com');
  await page.click('button-shows-alert');
  // Works! ✅
});
```

---

**Print this for students to use as reference! 📋**
