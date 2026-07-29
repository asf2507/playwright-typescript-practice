import { test, expect } from '@playwright/test';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

test('API response time stays within a reasonable threshold', async ({ request }) => {
  const timings: number[] = [];

  for (let i = 0; i < 3; i++) {
    const start = Date.now();
    const response = await request.get(`${BASE_URL}/posts/1`);
    const duration = Date.now() - start;

    timings.push(duration);
    expect(response.status()).toBe(200);
  }

  const average = timings.reduce((sum, value) => sum + value, 0) / timings.length;

  console.log(`Average API response time: ${average.toFixed(2)}ms`);
  expect(average).toBeLessThan(3000);
});

test('page render time stays within a reasonable threshold', async ({ page }) => {
  const start = Date.now();

  await page.setContent(`
    <html>
      <body>
        <h1>Performance Test</h1>
        <p>Page rendered successfully.</p>
      </body>
    </html>
  `);

  await page.locator('h1').waitFor();
  const duration = Date.now() - start;

  console.log(`Page render time: ${duration}ms`);
  expect(duration).toBeLessThan(2000);
});
