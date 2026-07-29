/// <reference types="node" />

import { test, expect } from '@playwright/test';
import { createConnection, type Connection } from 'mysql2/promise';

async function createConnectionToDb(): Promise<Connection> {
  const connection = await createConnection({
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS playwright_db');
  await connection.query('USE playwright_db');

  return connection;
}

test('create a user from UI and verify it in MySQL', async ({ page }) => {
  const connection = await createConnectionToDb();

  try {
    await connection.query('DROP TABLE IF EXISTS users');
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        subscription VARCHAR(100) NOT NULL,
        roles VARCHAR(200) NOT NULL
      )
    `);

    await page.route('https://demo.example/api/users', async route => {
      const payload = JSON.parse(route.request().postData() ?? '{}');

      await connection.execute(
        'INSERT INTO users (username, user_id, subscription, roles) VALUES (?, ?, ?, ?)',
        [payload.username, payload.user_id, payload.subscription, payload.roles]
      );

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'user created' }),
      });
    });

    await page.setContent(`
      <html>
        <body>
          <h2>Create User</h2>
          <form id="userForm">
            <input id="username" name="username" />
            <input id="userId" name="userId" />
            <input id="subscription" name="subscription" />
            <input id="roles" name="roles" />
            <button type="submit">Create User</button>
          </form>
          <div id="message"></div>
          <script>
            document.getElementById('userForm').addEventListener('submit', async function (e) {
              e.preventDefault();
              const payload = {
                username: document.getElementById('username').value,
                user_id: document.getElementById('userId').value,
                subscription: document.getElementById('subscription').value,
                roles: document.getElementById('roles').value
              };

              try {
                const response = await fetch('https://demo.example/api/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });

                const result = await response.json();
                document.getElementById('message').innerText = result.message || 'Created';
              } catch (err) {
                document.getElementById('message').innerText = 'Failed';
              }
            });
          </script>
        </body>
      </html>
    `);

    await page.fill('#username', 'Alice Johnson');
    await page.fill('#userId', 'U1001');
    await page.fill('#subscription', 'Premium');
    await page.fill('#roles', 'Admin,Editor');
    await page.click('button[type="submit"]');

    await expect(page.locator('#message')).toHaveText('user created');

    const [rows] = (await connection.execute(
      'SELECT username, user_id, subscription, roles FROM users WHERE user_id = ?',
      ['U1001']
    )) as [Array<{ username: string; user_id: string; subscription: string; roles: string }>, unknown];

    const userInDb = rows.length > 0 ? rows[0] : null;

    expect(userInDb).toMatchObject({
      username: 'Alice Johnson',
      user_id: 'U1001',
      subscription: 'Premium',
      roles: 'Admin,Editor',
    });
  } finally {
    await connection.end();
  }
});
