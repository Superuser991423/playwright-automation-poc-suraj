
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TOOLSHOP_BASE_URL;
const USER_EMAIL = process.env.TOOLSHOP_USER_EMAIL;
const USER_PASSWORD = process.env.TOOLSHOP_USER_PASSWORD;

const AUTH_FILE = path.resolve(
  process.cwd(),
  'playwright',
  '.auth',
  'toolshop.json'
);

test('@ui @auth A2 Login and Save Storage State', async ({ page }) => {

  // Step 1: Validate environment variables
  expect(BASE_URL, 'TOOLSHOP_BASE_URL is missing').toBeTruthy();
  expect(USER_EMAIL, 'TOOLSHOP_USER_EMAIL is missing').toBeTruthy();
  expect(USER_PASSWORD, 'TOOLSHOP_USER_PASSWORD is missing').toBeTruthy();

  // Step 2: Open Toolshop
  await page.goto(BASE_URL!);

  // Step 3: Navigate to Login page
  await page.getByText('Sign in', { exact: true }).click();

  // Step 4: Verify Login page
  await expect(
    page.locator('input[data-test="email"]')
  ).toBeVisible();

  // Step 5: Enter email
  await page.locator('input[data-test="email"]').fill(USER_EMAIL!);

  // Step 6: Enter password
  await page.locator('input[data-test="password"]').fill(USER_PASSWORD!);

  // Step 7: Click Login
  await page.getByRole('button', { name: 'Login' }).click();

  // Step 8: Wait for login response
  const accountHeading = page.locator('[data-test="page-title"]');
  const loginError = page.getByText('Invalid email or password', {
    exact: true
  });

  await expect(accountHeading.or(loginError)).toBeVisible({
    timeout: 15000
  });

  // Step 9: Handle unsuccessful login
  if (await loginError.isVisible()) {
    console.error('Login failed: Invalid email or password');
    console.log('Current URL:', page.url());

    await page.screenshot({
      path: 'test-results/a2-login-failed.png',
      fullPage: true
    });

    throw new Error(
      'Toolshop login failed. Please verify credentials in .env file.'
    );
  }

  // Step 10: Verify successful login
  await expect(accountHeading).toHaveText('My account');

  console.log('Login successful:', USER_EMAIL);

  // Step 11: Create authentication directory
  fs.mkdirSync(path.dirname(AUTH_FILE), {
    recursive: true
  });

  // Step 12: Save Storage State
  await page.context().storageState({
    path: AUTH_FILE
  });

  // Step 13: Verify Storage State file
  expect(fs.existsSync(AUTH_FILE)).toBeTruthy();

  const savedState = JSON.parse(
    fs.readFileSync(AUTH_FILE, 'utf-8')
  );

  expect(savedState).toHaveProperty('cookies');
  expect(savedState).toHaveProperty('origins');

  console.log('Storage State saved successfully!');
  console.log('File location:', AUTH_FILE);

});
