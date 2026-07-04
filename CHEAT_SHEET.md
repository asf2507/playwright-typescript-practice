# 🚀 PLAYWRIGHT CHEAT SHEET - For Teaching Students

## **QUICK REFERENCE**

---

## **1. NAVIGATING & INTERACTING**

```typescript
// Navigate to website
await page.goto('https://example.com');

// Click an element
await page.click('button');

// Type text
await page.fill('input', 'hello');

// Press key
await page.press('input', 'Enter');

// Hover over element
await page.hover('button');
```

---

## **2. FINDING ELEMENTS (LOCATORS)**

```typescript
// 🏆 BEST: By role (what users see)
await page.getByRole('button', { name: 'Login' }).click();

// 🥈 GOOD: By label
await page.getByLabel('Username').fill('user');

// 🥉 OKAY: By placeholder
await page.getByPlaceholder('Email').fill('test@test.com');

// 🟡 LESS IDEAL: By ID
await page.locator('#button-id').click();

// ❌ AVOID: XPath / Complex CSS
await page.locator('//*[@class="btn"]').click();
```

---

## **3. WAITING FOR ELEMENTS**

```typescript
// Wait for element to be visible (auto-wait)
await page.getByRole('button').click(); // Auto-waits!

// Explicit wait
await page.waitForSelector('button', { timeout: 5000 });

// Wait for navigation
await page.waitForNavigation();

// Wait for element hidden
await page.waitForSelector('button', { state: 'hidden' });
```

---

## **4. ASSERTIONS (VERIFY)**

```typescript
// Element visible
await expect(page.getByRole('button')).toBeVisible();

// Element hidden
await expect(page.getByRole('button')).toBeHidden();

// Element has text
await expect(page.getByRole('button')).toContainText('Login');

// Element has exact text
await expect(page.getByRole('button')).toHaveText('Login');

// Page title
await expect(page).toHaveTitle('Home');

// Page URL
await expect(page).toHaveURL('https://example.com');

// Element enabled/disabled
await expect(page.getByRole('button')).toBeEnabled();
```

---

## **5. PAGE OBJECT EXAMPLE**

```typescript
// PAGE OBJECT: Encapsulate page logic
class LoginPage {
  constructor(private page: Page) {}
  
  async login(user: string, pass: string) {
    await this.page.getByPlaceholder('Username').fill(user);
    await this.page.getByPlaceholder('Password').fill(pass);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}

// USAGE IN TEST
test('login test', async ({ page }) => {
  const login = new LoginPage(page);
  await login.login('admin', 'password');
});
```

---

## **6. TEST STRUCTURE (AAA Pattern)**

```typescript
test('scenario name', async ({ page }) => {
  // ARRANGE: Setup
  await page.goto('https://example.com');
  
  // ACT: Do something
  await page.getByRole('button').click();
  
  // ASSERT: Verify
  await expect(page.getByText('Success')).toBeVisible();
});
```

---

## **7. RUNNING TESTS**

```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/login.spec.ts

# Run tests matching pattern
npm test -- -g "login"

# Run in UI mode (see what's happening)
npm test -- --ui

# Run in headed mode (open browser)
npm test -- --headed

# Run single file
npm test tests/ecommerce.spec.ts
```

---

## **8. KEYBOARD & MOUSE**

```typescript
// Type slowly to see it
await page.type('input', 'hello', { delay: 100 });

// Click multiple times
await page.click('button', { clickCount: 3 });

// Right click
await page.click('element', { button: 'right' });

// Double click
await page.dblclick('element');

// Keyboard shortcuts
await page.press('key', 'Control+A'); // Select all
await page.press('key', 'Delete');   // Delete
```

---

## **9. TAKING SCREENSHOTS**

```typescript
// Save screenshot
await page.screenshot({ path: 'screenshot.png' });

// Screenshot of specific element
await page.locator('button').screenshot({ path: 'button.png' });
```

---

## **10. GETTING DATA FROM PAGE**

```typescript
// Get text content
const text = await page.textContent('h1');

// Get all text contents
const texts = await page.locator('li').allTextContents();

// Get input value
const value = await page.inputValue('input');

// Get attribute
const href = await page.getAttribute('a', 'href');

// Count elements
const count = await page.locator('li').count();
```

---

## **11. FORM OPERATIONS**

```typescript
// Fill input
await page.fill('input[name="email"]', 'test@test.com');

// Select option from dropdown
await page.selectOption('select', 'option-value');

// Check checkbox
await page.check('input[type="checkbox"]');

// Uncheck checkbox
await page.uncheck('input[type="checkbox"]');

// Fill entire form
await page.fill('form', {
  email: 'test@test.com',
  name: 'John',
  country: 'US'
});
```

---

## **12. DEBUGGING**

```typescript
// Pause execution (use in headed mode)
await page.pause();

// Print to console
console.log('Value:', value);

// Screenshot on failure
await page.screenshot({ path: 'failure.png' });

// See step-by-step with --headed
// npm test -- --headed
```

---

## **13. COMMON PATTERNS**

### **Login Pattern**
```typescript
async function login(page, user, pass) {
  await page.getByLabel('Username').fill(user);
  await page.getByLabel('Password').fill(pass);
  await page.getByRole('button', { name: 'Login' }).click();
}
```

### **Add to Cart Pattern**
```typescript
async function addToCart(page, productName) {
  await page.getByRole('link', { name: productName }).click();
  await page.getByRole('button', { name: 'Add to Cart' }).click();
}
```

### **Fill Form Pattern**
```typescript
async function fillForm(page, data) {
  await page.getByLabel('Name').fill(data.name);
  await page.getByLabel('Email').fill(data.email);
  await page.getByRole('button', { name: 'Submit' }).click();
}
```

---

## **14. BEST PRACTICES ⭐**

| ✅ DO | ❌ DON'T |
|------|---------|
| Use `getByRole()` | Use fragile XPath |
| One assertion per scenario | 100 assertions in one test |
| Use Page Objects | Mix page logic with tests |
| Wait automatically | Use Thread.sleep() |
| Descriptive test names | Test names like "test1" |
| Mock data | Hard-code values |

---

## **TEACHING TIPS**

💡 **Show, don't tell**
```
❌ "Locators find elements"
✅ Run: await page.getByRole('button').click(); // Show it working
```

💡 **Ask students questions**
```
"What do you think will happen if we click the button?"
"Why might this test fail?"
"How would we fix this?"
```

💡 **Use real examples**
```
"Netflix uses Playwright. Facebook uses it. Microsoft uses it."
```

💡 **Let them break it**
```
"Now, intentionally break the test. What error do we get?"
```

---

## **QUICK TEST TEMPLATE**

```typescript
import { test, expect } from '@playwright/test';

class YourPageObject {
  constructor(private page: Page) {}
  
  async yourAction() {
    await this.page.goto('URL');
    // Add actions
  }
}

test('Your test name', async ({ page }) => {
  // Create page object
  const yourPage = new YourPageObject(page);
  
  // Act
  await yourPage.yourAction();
  
  // Assert
  await expect(page.getByText('Expected text')).toBeVisible();
});
```

---

**Print this sheet for students! 📋**
