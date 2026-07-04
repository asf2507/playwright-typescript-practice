import {test} from '@playwright/test';

test('Market turnover fetch',async ({page})=>{

    const Product = 'Equity Derivatives'; //user specific user can change this


    //navigate to the website

    await page.goto('https://www.nseindia.com/');

    await page.waitForLoadState('networkidle');

    // find product row and will try to extract the value of that specific product


    const revenue=await page.locator(`//table[@class='table align-middle']//tbody/tr/td[contains(text(),"${Product}")]/following-sibling::td[2]`).textContent();

    if(revenue){
        console.log(`${Product} Value: ${revenue.trim()} crores`);
    }

    else{
        console.log(`Could not find revenue for ${Product}`);
    }

});