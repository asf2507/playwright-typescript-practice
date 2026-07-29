// @ts-check
// @ts-check
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

function readCsv(/** @type {string} */ filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = content.trim().split(/\r?\n/).filter(Boolean);

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].split(',').map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const values = row.split(',').map((value) => value.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || '';
      return obj;
    }, /** @type {Record<string, string>} */ ({}));
  });
}

test('read data from CSV and download a file', async ({ page }) => {
  const csvData = readCsv(path.join(process.cwd(), 'test-data', 'users.csv'));

  expect(csvData.length).toBeGreaterThan(0);

  for (const user of csvData) {
    await page.goto('https://demoqa.com/upload-download');
    await expect(page).toHaveTitle(/DEMOQA/);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    const download = await downloadPromise;

    const downloadPath = await download.path();

    expect(downloadPath).not.toBeNull();
    console.log(`Downloaded file for ${user.username}: ${user.email} (${user.role})`);
  }
});
