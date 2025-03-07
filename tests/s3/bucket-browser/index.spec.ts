import {test, expect} from '@playwright/test';

test('When browsing buckets, ensure the table displays the correct data', async ({page}) => {
    await page.goto('http://localhost:5173/s3-buckets');

    await expect(page).toHaveTitle('S3 Buckets - AWS Client');

    const table = page.locator('table[data-testid="bucket-records-table"]');

    const caption = table.locator('caption');
    await expect(caption).toHaveText('S3 Buckets');

    const headers = table.locator('thead tr th');
    await expect(headers).toHaveText(['Bucket Name', '']);

    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(1);

    const firstRowCells = rows.nth(0).locator('td');
    await expect(firstRowCells).toHaveText(['callum-test-bucket', 'View Contents']);

    const link = firstRowCells.nth(1).locator('a');
    await expect(link).toHaveAttribute('href', '/s3-buckets/callum-test-bucket');
});