import { test, expect } from '@playwright/test';

const BASE_URL = 'https://reqres.in/api';

async function getToken(request: any) {
  const response = await request.post(`${BASE_URL}/login`, {
    data: {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka',
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.token).toBeTruthy();
  return body.token as string;
}

test('GET request returns expected user data', async ({ request }) => {
  const response = await request.get(`${BASE_URL}/users/2`);

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.data).toMatchObject({
    id: 2,
    email: 'janet.weaver@reqres.in',
    first_name: 'Janet',
    last_name: 'Weaver',
  });
});

test('POST request creates a new user', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/users`, {
    data: {
      name: 'Alice',
      job: 'QA Engineer',
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body).toMatchObject({
    name: 'Alice',
    job: 'QA Engineer',
  });
  expect(body.id).toBeTruthy();
});

test('login and access a protected endpoint using token', async ({ request }) => {
  const token = await getToken(request);

  const response = await request.get(`${BASE_URL}/users/2`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.id).toBe(2);
});

test('mock API response for frontend request', async ({ page }) => {
  await page.route(`${BASE_URL}/users/2`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 2,
          email: 'mocked.user@reqres.in',
          first_name: 'Mocked',
          last_name: 'User',
        },
      }),
    });
  });

  await page.setContent(`
    <html>
      <body>
        <script>
          fetch('${BASE_URL}/users/2')
            .then(response => response.json())
            .then(data => {
              document.body.innerHTML = '<h1>' + data.data.first_name + ' ' + data.data.last_name + '</h1>';
            });
        </script>
      </body>
    </html>
  `);

  await expect(page.locator('h1')).toHaveText('Mocked User');
});
