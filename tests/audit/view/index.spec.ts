import {test, expect} from '@playwright/test';

test('When searching for audit records, ensure the table displays the correct data', async ({page}) => {
    await page.goto('http://localhost:5173/audit');

    await expect(page).toHaveTitle('Audit - AWS Client');

    await page.getByTestId('event-type-select').locator('select').selectOption('MODIFY');
    await page.getByTestId('bucket-name-input').locator('input').fill('callum-test-bucket');
    await page.getByTestId('object-key-input').locator('input').fill('path1/path2/file.txt');
    await page.getByTestId('button-search').click();

    const table = page.getByTestId('audit-results-table');

    const caption = table.locator('caption');
    await expect(caption).toHaveText('Audit Results');

    const headers = table.locator('thead tr th');
    await expect(headers).toHaveText(['Bucket Name', 'Object Key', 'Action Timestamp', 'Event Type', 'User Name', '']);

    const rows = table.locator('tbody tr');

    const firstRowCells = rows.nth(0).locator('td');
    await expect(firstRowCells).toContainText(['callum-test-bucket', 'path1/path2/file.txt', '', 'MODIFY', 'admin', 'View Diff']);
});