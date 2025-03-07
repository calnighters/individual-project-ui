import {test, expect} from '@playwright/test';

test('When editing a file, ensure the file can be edited correctly', async ({page}) => {
    await page.goto('http://localhost:5173/s3-buckets/callum-test-bucket');

    await expect(page).toHaveTitle('S3 Bucket Contents - AWS Client');

    const table = page.locator('table[data-testid="bucket-records-table"]');
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(1);

    const firstRowCells = rows.nth(0).locator('td');
    const link = firstRowCells.nth(3).locator('a');

    await link.click();

    await expect(page).toHaveTitle('Modify File - AWS Client');

    await expect(page.locator('h1')).toHaveText('Object path1/path2/file.txt');
    const textArea = page.locator('textarea[id="object-content"]');
    await expect(textArea).toHaveText('Hello\nthere');
});