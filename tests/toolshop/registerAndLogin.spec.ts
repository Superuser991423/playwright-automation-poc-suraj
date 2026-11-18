
import { test, expect } from '@playwright/test';

const API_URL = process.env.TOOLSHOP_API_URL;

test('@api @ui A1 Register user through API and login through UI', async ({ request, page }) => {

  // Step 1: Validate API configuration
  expect(API_URL, 'TOOLSHOP_API_URL must be configured').toBeTruthy();

  // Step 2: Generate unique user details
  const timestamp = Date.now();

  const userData = {
    first_name: 'Suraj',
    last_name: 'Maurya',
    email: `suraj${timestamp}@example.com`,
  password: `Suraj!Qa#${timestamp}x`,
    dob: '2000-04-15',
    phone: '9876543210',
    address: {
      street: 'Test Street 123',
      city: 'Mohali',
      state: 'Punjab',
      country: 'India',
      postal_code: '160055'
    }
  };

  // Step 3: Send API registration request
  const response = await request.post(`${API_URL}/users/register`, {
    data: userData,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Step 4: Read and inspect API response
  const responseBody = await response.json();

  console.log('API Status:', response.status());
  console.log('API Response:', JSON.stringify(responseBody, null, 2));

  // Step 5: Verify registration response
  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('id');
  expect(responseBody.email).toBe(userData.email);
  expect(responseBody.first_name).toBe(userData.first_name);

  console.log('User registered successfully:', responseBody.email);

  // Step 6: Open Toolshop login page
  await page.goto(process.env.TOOLSHOP_BASE_URL!);

  // Step 7: Navigate to Sign in
  await page.getByText('Sign in', { exact: true }).click();

  // Step 8: Enter registered user credentials
  await page.locator('input[data-test="email"]').fill(userData.email);
  await page.locator('input[data-test="password"]').fill(userData.password);

  // Step 9: Click Login
  await page.getByRole('button', { name: 'Login' }).click();

  // Step 10: Verify successful login
 await expect(page.locator('[data-test="page-title"]')).toHaveText('My account');

  console.log('UI Login successful:', userData.email);


});
