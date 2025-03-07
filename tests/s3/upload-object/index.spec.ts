import {test, expect} from '@playwright/test';
import * as path from "path";

test('When uploading a file, ensure the file can be uploaded correctly', async ({page}) => {
    await page.goto('http://localhost:5173/s3-buckets/callum-test-bucket');

    await expect(page).toHaveTitle('S3 Bucket Contents - AWS Client');

    const button = page.locator('button');
    await expect(button).toHaveText('Upload File');

    await button.click();

    await expect(page).toHaveTitle('Upload File - AWS Client');

    const fileInput = page.locator('input[type="file"]');
    const filePath = path.resolve('tests/resources/file.txt');
    await fileInput.setInputFiles(filePath);

    const textInput = page.locator('input[type="text"]');
    await textInput.fill('path2/file2.txt');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await expect(page).toHaveTitle('Change Confirmation - AWS Client');

    const panel = page.getByTestId('panel');
    await expect(panel).toContainText('New Upload');
    await expect(panel).toContainText('The file path2/file2.txt is being uploaded to bucket callum-test-bucket.');

});