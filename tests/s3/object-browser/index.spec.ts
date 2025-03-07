import {test, expect} from '@playwright/test';

test('When browsing objects in a bucket, ensure the table displays the correct data', async ({page}) => {
    await page.goto('http://localhost:5173/s3-buckets/callum-test-bucket');

    await expect(page).toHaveTitle('S3 Bucket Contents - AWS Client');

    const table = page.locator('table[data-testid="bucket-records-table"]');

    const caption = table.locator('caption');
    await expect(caption).toHaveText('Contents of callum-test-bucket');

    const headers = table.locator('thead tr th');
    await expect(headers).toHaveText(['Object Key', 'Object Size (bytes)', 'Last Modified', '']);

    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(1);

    const firstRowCells = rows.nth(0).locator('td');
    await expect(firstRowCells).toContainText(['path1/path2/file.txt', '12', '', 'View File']);

    const link = firstRowCells.nth(3).locator('a');
    await expect(link).toHaveAttribute('href', '/s3-buckets/callum-test-bucket/edit');
});