import { test, expect, Page } from '@playwright/test';


class LoginPage {
  // Constructor receives the page object from Playwright
  constructor(private page: Page) {}

  //  What are locators?
  // Locators are selectors that identify elements on the page
  // Common locators: id, class, xpath, role, text, placeholder, etc.
  
  // Method to navigate to login page
  async goto() {
    // page.goto() navigates to a URL
    // Using demo site Swag Labs - free e-commerce testing site
    await this.page.goto('https://www.saucedemo.com/');
  }

  // Method to perform login
  async login(username: string, password: string) {
    // Type username in the username field
    // getByPlaceholder() finds element by placeholder text (user-friendly!)
    await this.page.getByPlaceholder('Username').fill(username);
    
    // Type password in password field
    await this.page.getByPlaceholder('Password').fill(password);
    
    // Click the LOGIN button using role (semantic approach)
    //  Why use getByRole()?
    // - Gets elements by their accessibility role
    // - More resilient to CSS changes
    // - Follows best practices for inclusive testing
    await this.page.getByRole('button', { name: /login/i }).click();
  }

  // Method to verify successful login
  async verifyLoginSuccess() {
    // Wait for and verify the products page loads
    //  What is waitFor?
    // - Waits for an element to be visible (up to 30 seconds by default)
    // - Prevents "element not found" errors due to page loading delays
    await this.page.waitForSelector('[data-testid="inventory-container"]');
    
    // Assert that we can see the inventory page title
    //  What is expect()?
    // - Assertion function that checks if condition is true
    // - Test FAILS if assertion fails
    // - Makes test results clear and readable
    await expect(this.page).toHaveTitle(/Swag Labs/);
  }
}

// ============================================================================
// PART 2: PRODUCTS PAGE CLASS
// ============================================================================

class ProductsPage {
  constructor(private page: Page) {}

  // Method to select a product by name
  async selectProduct(productName: string) {
    // Find product link by text and click it
    //  Why partial matching with >>?
    // Locator chains help narrow down to specific elements
    const productLink = this.page.getByRole('link', { name: productName });
    await productLink.click();
    
    // Wait for product detail page to load
    await this.page.waitForSelector('[data-testid="inventory-item-container"]');
  }

  // Method to add product to cart
  async addToCart() {
    // Find and click the "ADD TO CART" button
    await this.page.getByRole('button', { name: /add to cart/i }).click();
    
    //  Verify the action was successful
    // Check that button text changed to "REMOVE"
    const button = this.page.getByRole('button', { name: /remove/i });
    await expect(button).toBeVisible();
  }

  // Method to go back to products list
  async backToProducts() {
    await this.page.getByRole('button', { name: /back/i }).click();
  }

  // Method to navigate to cart
  async goToCart() {
    // Click the cart icon
    //  Using data-testid is common in modern apps
    await this.page.click('[data-testid="shopping-cart-link"]');
  }

  // Method to get product count in cart
  async getCartBadgeCount(): Promise<string> {
    //  Extracting data from page
    // textContent() gets the visible text of an element
    const badge = this.page.locator('[data-testid="shopping-cart-badge"]');
    return await badge.textContent() || '0';
  }
}

// ============================================================================
// PART 3: CART PAGE CLASS
// ============================================================================

class CartPage {
  constructor(private page: Page) {}

  // Method to verify items in cart
  async verifyCartItems(expectedCount: number) {
    //  What is locator.count()?
    // Returns the number of elements matching the locator
    const cartItems = this.page.locator('[data-test="cart-list-item"]');
    const count = await cartItems.count();
    expect(count).toBe(expectedCount);
  }

  // Method to verify item details in cart
  async verifyItemInCart(productName: string, price: string) {
    // Check if product exists in cart
    const itemName = this.page
      .locator('[data-test="inventory-item-name"]')
      .filter({ hasText: productName });
    
    await expect(itemName).toBeVisible();
    
    // Check product price
    const itemPrice = this.page
      .locator('[data-test="inventory-item-price"]')
      .filter({ hasText: price });
    
    await expect(itemPrice).toBeVisible();
  }

  // Method to proceed to checkout
  async proceedToCheckout() {
    // Click CHECKOUT button
    await this.page.getByRole('button', { name: /checkout/i }).click();
    
    // Wait for checkout page to load
    await this.page.waitForSelector('[data-testid="checkout_info_container"]');
  }

  // Method to remove item from cart
  async removeItem(productName: string) {
    // Find the remove button for specific product and click
    const removeButton = this.page.locator('[data-test="remove-[product-id]"]');
    await removeButton.click();
  }
}

// ============================================================================
// PART 4: CHECKOUT PAGE CLASS
// ============================================================================

class CheckoutPage {
  constructor(private page: Page) {}

  // Method to fill checkout information
  async fillCheckoutInfo(firstName: string, lastName: string, zipCode: string) {
    //  Form filling is a core automation task
    // Three main fields to fill on checkout page
    
    // Fill First Name
    // getByLabel() finds by associated label text
    await this.page.getByLabel('First Name').fill(firstName);
    
    // Fill Last Name
    await this.page.getByLabel('Last Name').fill(lastName);
    
    // Fill Postal Code
    await this.page.getByLabel('Zip/Postal Code').fill(zipCode);
    
    console.log('✅ Checkout form filled with:', { firstName, lastName, zipCode });
  }

  // Method to continue to payment
  async continueToPayment() {
    // Click CONTINUE button
    await this.page.getByRole('button', { name: /continue/i }).click();
    
    // Wait for confirmation/payment page
    await this.page.waitForSelector('[data-testid="checkout_summary_container"]');
  }

  // Method to finish order
  async finishOrder() {
    // Click FINISH button to complete purchase
    const finishBtn = this.page.getByRole('button', { name: /finish/i });
    await finishBtn.click();
  }

  // Method to verify order success
  async verifyOrderSuccess(): Promise<string> {
    //  Extracting text from elements
    // Verify success message appears
    const successMsg = this.page.getByRole('heading', { name: /thank you/i });
    await expect(successMsg).toBeVisible();
    
    // TEACHING: Getting dynamic content
    // Extract order details or message
    const message = await this.page
      .locator('[data-testid="complete-header"]')
      .textContent();
    
    return message || 'Order completed';
  }
}

// ============================================================================
// PART 5: THE ACTUAL TEST (Bringing it all together)
// ============================================================================
// 
//  The test structure
// 1. Setup (create page objects)
// 2. Execute (perform actions)
// 3. Verify (assert results)
// This is called AAA pattern: Arrange, Act, Assert

test.describe('🛒 E-Commerce Shopping Cart Workflow', () => {
  
  // TEACHING: test.beforeEach() runs BEFORE each test
  // Common setup: create objects, navigate to base URL, login
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    // Initialize all page objects
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  // ========================================================================
  // TEST CASE 1: Login Test
  // ========================================================================
  // 
  // Purpose: Verify user can login with valid credentials
  // Expected Result: Dashboard/Products page loads successfully
  
  test('✅ Scenario 1: User should login successfully with valid credentials', async () => {
    console.log('🚀 Starting Test: Login Scenario');
    
    // STEP 1: Navigate to login page
    console.log('📍 Step 1: Navigating to Swag Labs website');
    await loginPage.goto();
    
    // STEP 2: Enter credentials
    console.log('📝 Step 2: Entering login credentials (standard_user / password123)');
    await loginPage.login('standard_user', 'secret_sauce');
    
    // STEP 3: Verify login success
    console.log('✔️ Step 3: Verifying login was successful');
    await loginPage.verifyLoginSuccess();
    
    console.log('✅ Test PASSED: User logged in successfully\n');
  });

  // ========================================================================
  // TEST CASE 2: Add Single Product to Cart
  // ========================================================================
  // 
  // Purpose: Verify user can add a product to cart
  // Expected Result: Cart count updates, product appears in cart
  
  test('✅ Scenario 2: User should add product to cart', async () => {
    console.log('🚀 Starting Test: Add to Cart Scenario');
    
    // STEP 1: Login
    console.log('📍 Step 1: Logging in...');
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    
    // STEP 2: Select product
    console.log('📝 Step 2: Selecting product "Sauce Labs Backpack"');
    await productsPage.selectProduct('Sauce Labs Backpack');
    
    // STEP 3: Add to cart
    console.log('🛒 Step 3: Adding product to cart');
    await productsPage.addToCart();
    
    // STEP 4: Navigate to cart
    console.log('🛒 Step 4: Navigating to shopping cart');
    await productsPage.goToCart();
    
    // STEP 5: Verify product in cart
    console.log('✔️ Step 5: Verifying product appears in cart');
    await cartPage.verifyCartItems(1);
    await cartPage.verifyItemInCart('Sauce Labs Backpack', '29.99');
    
    console.log('✅ Test PASSED: Product added to cart successfully\n');
  });

  // ========================================================================
  // TEST CASE 3: Complete Shopping & Checkout
  // ========================================================================
  // 
  // Purpose: Verify complete shopping journey from login to order confirmation
  // Expected Result: Order completes successfully with confirmation message
  
  test('✅ Scenario 3: User should complete full shopping workflow', async () => {
    console.log('🚀 Starting Test: Complete Shopping Workflow\n');
    
    // ---- ACT 1: LOGIN ----
    console.log('═══════════════════════════════════════');
    console.log('📌 PART 1: USER AUTHENTICATION');
    console.log('═══════════════════════════════════════');
    
    console.log('►  Navigating to website...');
    await loginPage.goto();
    await loginPage.verifyLoginSuccess();
    
    console.log('►  Entering credentials...');
    await loginPage.login('standard_user', 'secret_sauce');
    console.log('✅ Login successful!\n');

    // ---- ACT 2: ADD PRODUCTS ----
    console.log('═══════════════════════════════════════');
    console.log('📌 PART 2: SHOPPING - ADD PRODUCTS');
    console.log('═══════════════════════════════════════');
    
    // Add first product
    console.log('►  Adding "Sauce Labs Backpack" to cart...');
    await productsPage.selectProduct('Sauce Labs Backpack');
    await productsPage.addToCart();
    await productsPage.backToProducts();
    console.log('✅ Product 1 added!\n');
    
    // Add second product
    console.log('►  Adding "Sauce Labs Bolt T-Shirt" to cart...');
    await productsPage.selectProduct('Sauce Labs Bolt T-Shirt');
    await productsPage.addToCart();
    console.log('✅ Product 2 added!\n');

    // ---- ACT 3: REVIEW CART ----
    console.log('═══════════════════════════════════════');
    console.log('📌 PART 3: REVIEW SHOPPING CART');
    console.log('═══════════════════════════════════════');
    
    console.log('►  Navigating to cart...');
    await productsPage.goToCart();
    
    console.log('✓  Verifying cart has 2 items...');
    await cartPage.verifyCartItems(2);
    
    console.log('✓  Verifying first product details...');
    await cartPage.verifyItemInCart('Sauce Labs Backpack', '29.99');
    
    console.log('✓  Verifying second product details...');
    await cartPage.verifyItemInCart('Sauce Labs Bolt T-Shirt', '15.99');
    console.log('✅ Cart verified!\n');

    // ---- ACT 4: CHECKOUT ----
    console.log('═══════════════════════════════════════');
    console.log('📌 PART 4: CHECKOUT PROCESS');
    console.log('═══════════════════════════════════════');
    
    console.log('►  Proceeding to checkout...');
    await cartPage.proceedToCheckout();
    
    console.log('►  Filling checkout information...');
    await checkoutPage.fillCheckoutInfo('John', 'Doe', '12345');
    
    console.log('►  Moving to payment confirmation...');
    await checkoutPage.continueToPayment();
    
    console.log('►  Completing order...');
    await checkoutPage.finishOrder();
    console.log('✅ Order submitted!\n');

    // ---- ASSERT: VERIFY SUCCESS ----
    console.log('═══════════════════════════════════════');
    console.log('📌 PART 5: VERIFY ORDER SUCCESS');
    console.log('═══════════════════════════════════════');
    
    const successMessage = await checkoutPage.verifyOrderSuccess();
    console.log('✓  Success message: ' + successMessage);
    
    console.log('\n🎉 TEST PASSED: Complete workflow successful!\n');
  });

  // ========================================================================
  // TEST CASE 4: Login Error Handling
  // ========================================================================
  // 
  // Purpose: Verify app handles invalid login gracefully
  // Expected Result: Error message displayed, user stays on login page
  
  test('✅ Scenario 4: System should show error for invalid credentials', async ({ page }) => {
    console.log('🚀 Starting Test: Invalid Login Error Handling\n');
    
    // Navigate to login page
    await loginPage.goto();
    
    // Try logging in with wrong password
    console.log('►  Attempting login with invalid credentials...');
    await loginPage.login('standard_user', 'wrong_password');
    
    // TEACHING: Wait for error message
    // waitForSelector with timeout waits for element to appear
    console.log('►  Waiting for error message...');
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
    
    // Extract and verify error message
    const errorMsg = await page
      .locator('[data-testid="error-message"]')
      .textContent();
    
    console.log('✓  Error message displayed: ' + errorMsg);
    
    // Verify still on login page
    await expect(page).toHaveTitle(/Swag Labs/);
    
    console.log('✅ TEST PASSED: Error handling works correctly\n');
  });

  // ========================================================================
  // TEST CASE 5: Sort Products
  // ========================================================================
  // 
  // Purpose: Verify product sorting functionality
  // Expected Result: Products displayed in correct order by price
  
  test('✅ Scenario 5: User should be able to sort products by price', async ({ page }) => {
    console.log('🚀 Starting Test: Product Sorting\n');
    
    // Login
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    
    // TEACHING: Selecting dropdown option
    console.log('►  Selecting sort option "Price (low to high)"...');
    
    // Find and click the sort dropdown
    const sortDropdown = page.locator('[data-testid="product-sort-container"]');
    await sortDropdown.selectOption('lohi');
    
    // TEACHING: Verifying sorted data
    // Get all product prices and verify they're in ascending order
    console.log('►  Verifying products are sorted by price...');
    const prices = await page
      .locator('[data-testid="inventory-item-price"]')
      .allTextContents();
    
    // Convert price strings to numbers and verify ascending order
    const priceNumbers = prices.map(p => parseFloat(p.replace('$', '')));
    const isSorted = priceNumbers.every((price, i) => i === 0 || price >= priceNumbers[i - 1]);
    
    console.log('✓  Prices in order: ' + prices.join(', '));
    expect(isSorted).toBe(true);
    
    console.log('✅ TEST PASSED: Products sorted correctly\n');
  });
});

// ============================================================================
// 🎓 TEACHING KEY CONCEPTS SUMMARY
// ============================================================================
//
// 1. **Page Objects**: Separates test logic from page details
//    - Makes tests readable: test reads like a story
//    - Makes maintenance easy: UI changes only affect POM
//
// 2. **Locators**: Different ways to find elements
//    - getByRole() - Best! Uses accessibility roles
//    - getByLabel() - For form labels
//    - getByPlaceholder() - For input fields
//    - locator('[data-testid="..."]') - By test ID
//    - Avoid: XPath (brittle), CSS selectors (tight coupling)
//
// 3. **Assertions**: Verify expected outcomes
//    - expect(element).toBeVisible()
//    - expect(element).toHaveText()
//    - expect(page).toHaveTitle()
//
// 4. **Wait Strategies**:
//    - waitForSelector() - Wait for element to exist
//    - Locator auto-wait - Playwright waits automatically!
//    - Avoid: Thread.sleep() (bad practice)
//
// 5. **Test Structure** (AAA Pattern):
//    - Arrange: Setup (login, navigate)
//    - Act: Perform actions (click, type)
//    - Assert: Verify results (expect)
//
// 6. **Best Practices**:
//    - One logical action per test
//    - Clear test names describing what's tested
//    - Use page objects for reusability
//    - Add console.logs for debugging
//    - Use descriptive locators, not brittle XPaths
//
// ============================================================================
