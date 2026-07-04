# 🎓 TEACHING GUIDE: E-Commerce Automation with Playwright & TypeScript

## 📖 How to Teach This Scenario to Students

---

## **CLASS STRUCTURE (90 minutes)**

### **Part 1: Introduction (10 mins)**
```
"Today we're learning automation by testing an e-commerce website.
 Imagine you work at Flipkart. Every time they update the website,
 you need to manually test the shopping cart. What if we write code to do it?"
```

**Show them:**
- Navigate to https://www.saucedemo.com/
- Show the Login, Products, Cart, and Checkout pages
- Explain: "We'll automate all of this!"

---

### **Part 2: Concept Explanation (15 mins)**

#### **Concept 1: What is a Locator?**
```typescript
// 4 Ways to Find Elements (Best to Worst):

// ✅ BEST: Find by what users see
await page.getByRole('button', { name: 'Login' }).click();

// ✅ GOOD: Find by label for forms
await page.getByLabel('Username').fill('user');

// ✅ OKAY: Find by placeholder
await page.getByPlaceholder('Enter email').fill('test@test.com');

// ❌ AVOID: Brittle XPath or CSS
await page.locator('//*[@id="btn-123"]').click();  // Bad! If ID changes, test breaks
```

**Teaching Script:**
> "Locators are how we find elements on the page. Think of it like directions:
>  - Bad: "Click the element at pixel 500,200"
>  - Good: "Click the button that says 'Login'"
>  
>  The better the locator, the fewer times your test breaks!"

---

#### **Concept 2: Page Object Model (Why Reusable?)**

**Show without POM (BAD):**
```typescript
// ❌ Test logic mixed with page details
test('login test', async ({ page }) => {
  await page.fill('#username-field', 'user');
  await page.fill('#pwd-field', 'pass');
  await page.click('.login-btn');
  // If Swag Labs changes the selectors, test breaks!
});
```

**Show with POM (GOOD):**
```typescript
// ✅ Separated and reusable
const loginPage = new LoginPage(page);
await loginPage.login('user', 'pass');

// If Swag Labs changes selectors, we only update LoginPage class!
// All tests using LoginPage still work!
```

**Teaching Script:**
> "In real companies, the website changes all the time. Without POM, you'd need
>  to fix every test. With POM, you fix it in ONE place. Let me show you..."

---

#### **Concept 3: The AAA Pattern (Test Structure)**

```
Arrange → Act → Assert
Setup  →  Do  → Verify
```

**Teaching Script:**
> "Every test has 3 parts:
> 1. **Arrange**: Get ready (login, navigate)
> 2. **Act**: Do something (click, type)
> 3. **Assert**: Check if it worked"

**Visual Example:**
```typescript
// ARRANGE
const loginPage = new LoginPage(page);
await loginPage.goto();

// ACT
await loginPage.login('standard_user', 'secret_sauce');

// ASSERT
await loginPage.verifyLoginSuccess();
```

---

### **Part 3: Walk Through Code (30 mins)**

#### **Step 1: Show LoginPage class**
```typescript
class LoginPage {
  constructor(private page: Page) {}
  
  async login(username: string, password: string) {
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: /login/i }).click();
  }
}
```

**Explain:**
- Constructor receives the page → "This is our connection to the website"
- `fill()` → types text (like you using keyboard)
- `click()` → clicks button (like you using mouse)
- `/login/i` → finds "LOGIN", "Login", "login" (case insensitive)

---

#### **Step 2: Show ProductsPage class**
```typescript
class ProductsPage {
  async selectProduct(productName: string) {
    const productLink = this.page.getByRole('link', { name: productName });
    await productLink.click();
  }
  
  async addToCart() {
    await this.page.getByRole('button', { name: /add to cart/i }).click();
  }
}
```

**Explain:**
- Methods represent user actions
- One method = one user task
- Easy to reuse in different tests

---

#### **Step 3: Show the Test**
```typescript
test('User should login successfully', async () => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await loginPage.verifyLoginSuccess();
});
```

**Explain:**
- Test reads like a story
- No need to know HTML/CSS
- Even non-technical people can understand it!

---

### **Part 4: Live Demo (25 mins)**

#### **Demo 1: Run a Simple Test**
```bash
# In terminal, run:
npm test -- tests/ecommerce-shopping.spec.ts -g "should login"
```

**Show:**
- Browser opens automatically
- Test performs the login
- Test passes/fails
- HTML report generated

---

#### **Demo 2: Show Failure Recovery**
```bash
# Introduce a bug intentionally
# Change username to 'wrong_user'

npm test
```

**Explain:**
- Test fails (expected)
- Error message shows exactly what failed
- This is why we test = catch bugs early!

---

#### **Demo 3: Run Full Workflow Test**
```bash
npm test -- tests/ecommerce-shopping.spec.ts -g "complete full shopping"
```

**Show:**
- Login
- Search product
- Add to cart
- Checkout
- Order confirmation

**Let students watch the browser do the shopping!**

---

### **Part 5: Interactive Q&A (10 mins)**

**Ask students:**

1. **"Why use Playwright instead of manual testing?"**
   - Faster (seconds vs minutes)
   - Repeatable (same every time)
   - Catches regressions early
   - Runs 24/7 on servers

2. **"What if the website changes?"**
   - Update page objects only
   - Tests still work
   - Takes 5 minutes vs hours

3. **"Can we test other scenarios?"**
   - Yes! What if password is wrong?
   - What if product is out of stock?
   - What if user cancels checkout?

---

## **📝 HOMEWORK ASSIGNMENT FOR STUDENTS**

### **Task 1: Modify Login Test**
```typescript
// Modify the login test to check for error message:
test('System should show error for invalid password', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // Login with WRONG password
  await loginPage.login('standard_user', 'wrong_password');
  
  // TASK: Verify error message appears
  // Hint: Look for element with data-testid="error-message"
  
  // TASK: Verify error message contains "do not match"
  // Hint: Use toContainText()
});
```

---

### **Task 2: Create New Test**
```typescript
// Write a test that:
// 1. Logs in
// 2. Adds TWO different products to cart
// 3. Removes one product
// 4. Verifies cart has 1 item

test('User should be able to remove items from cart', async () => {
  // YOUR CODE HERE
});
```

---

### **Task 3: Troubleshoot**
**Provide a broken test:**
```typescript
test('broken test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  // Missing: actual login call
  await loginPage.verifyLoginSuccess(); // This will fail!
});
```

**Have students:**
- Run it
- See it fail
- Fix it

---

## **🔧 TROUBLESHOOTING - Common Student Mistakes**

### **Mistake 1: Selector Changed**
```
❌ Error: "element not found"

Solution: Show how to update the locator in PageObject
```

### **Mistake 2: Timing Issue**
```
❌ Error: "Waiting for selector timed out"

Solution: Add waitForSelector() or slow down
```

### **Mistake 3: Forgetting Async/Await**
```
❌ Error: "Promise not resolved"

Solution: Explain: "Always use async/await in Playwright"
```

---

## **💡 REAL-WORLD CONNECTION**

**Tell students:**

> "At Amazon, they have 1000s of tests running daily.
>  At Flipkart, automation catches bugs BEFORE users see them.
>  At Microsoft, Playwright is used to test Visual Studio Code.
> 
>  This skill = $100K+ job!"

---

## **📚 RESOURCES TO SHARE**

1. **Playwright Docs**: https://playwright.dev/docs
2. **Swag Labs Practice Site**: https://www.saucedemo.com/
3. **Best Practices**: https://playwright.dev/docs/best-practices

---

## **🎯 KEY TAKEAWAYS FOR STUDENTS**

1. **Locators**: Use accessible selectors (byRole, byLabel)
2. **Page Objects**: Make tests reusable
3. **Assertions**: Prove tests passed
4. **AAA Pattern**: Arrange → Act → Assert
5. **Real Value**: Automation saves time, catches bugs, improves quality

---

## **⏱️ TIME BREAKDOWN**

| Activity | Time |
|----------|------|
| Intro & Problem Statement | 10 min |
| Concept Teaching | 15 min |
| Code Walkthrough | 30 min |
| Live Demo | 25 min |
| Q&A | 10 min |
| **Total** | **90 min** |

---

## **TIPS FOR BETTER TEACHING**

✅ **Make it Interactive**: Ask "What do you think will happen?"  
✅ **Live Code**: Don't just show slides, actually run code  
✅ **Relate to Real World**: "This is what Netflix uses"  
✅ **Let Them Try**: Give 5 minutes for hands-on practice  
✅ **Normalize Failure**: "Tests should fail sometimes, that's good!"

Good luck teaching! 🚀
