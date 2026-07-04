5
import { test, expect } from '@playwright/test';

test("handle popups", async ({ browser }) => {

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

    await Promise.all([
        page.waitForEvent('popup'),
        
        await page.locator("#PopUp").click()
    ]);

    const allPopupWindows = context.pages(); // Returns array of pages 

    console.log("Number of pages/windows:", allPopupWindows.length);

    console.log(await allPopupWindows[0].url()); // main page
    console.log(await allPopupWindows[1].url()); // selenium
    console.log(await allPopupWindows[2].url()); // playwright

    for (const pw of allPopupWindows) {
        const title = await pw.title();

        if (title.includes('Playwright')) {
            await pw.locator(".getStarted_Sign").click();
            await page.waitForTimeout(5000);

            // Perform any other actions

            await pw.close(); // This will close playwright popup window
        }
    }

    await page.waitForTimeout(5000);
});




