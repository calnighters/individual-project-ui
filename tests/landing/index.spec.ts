import {test, expect} from '@playwright/test';

test('When navigating to the landing page, ensure the correct links are displayed', async ({page}) => {
    await page.goto('http://localhost:5173');

    await expect(page).toHaveTitle('AWS Client');

    await expect(page.getByTestId('menu-item-0')).toHaveText('S3');

    await expect(page.getByTestId('menu-item-1')).toHaveText('Audit');
});