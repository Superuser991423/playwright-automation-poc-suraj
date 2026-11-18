
import { test, expect } from '@playwright/test';

test('@api A9 Get Products API with Pagination', async ({ request }) => {

  // Step 1: Send GET request for the first page
  const response = await request.get(
    'https://api.practicesoftwaretesting.com/products?page=1'
  );

  // Step 2: Validate HTTP status
  expect(response.status()).toBe(200);
  expect(response.ok()).toBeTruthy();

  // Step 3: Read API response
  const responseBody = await response.json();

  // Step 4: Validate response structure
  expect(Array.isArray(responseBody.data)).toBeTruthy();
  expect(responseBody.data.length).toBeGreaterThan(0);

  // Step 5: Validate pagination fields and data types
  expect(typeof responseBody.current_page).toBe('number');
  expect(typeof responseBody.last_page).toBe('number');
  expect(typeof responseBody.per_page).toBe('number');
  expect(typeof responseBody.total).toBe('number');

  expect(responseBody.current_page).toBe(1);
  expect(responseBody.last_page).toBeGreaterThan(0);
  expect(responseBody.per_page).toBeGreaterThan(0);
  expect(responseBody.total).toBeGreaterThan(0);

  expect(responseBody.last_page).toBe(
    Math.ceil(responseBody.total / responseBody.per_page)
  );

  expect(responseBody.data.length).toBeLessThanOrEqual(
    responseBody.per_page
  );

  // Step 6: Validate individual product structure
  const firstProduct = responseBody.data[0];

  expect(typeof firstProduct.id).toBe('string');
  expect(typeof firstProduct.name).toBe('string');
  expect(typeof firstProduct.price).toBe('number');
  expect(typeof firstProduct.description).toBe('string');

  expect(typeof firstProduct.in_stock).toBe('boolean');
  expect(typeof firstProduct.is_rental).toBe('boolean');

  // Step 7: Validate nested objects
  expect(firstProduct.category).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      slug: expect.any(String)
    })
  );

  expect(firstProduct.brand).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String)
    })
  );

  // Step 8: Request and validate second page
  if (responseBody.last_page >= 2) {

    const secondPageResponse = await request.get(
      'https://api.practicesoftwaretesting.com/products?page=2'
    );

    expect(secondPageResponse.status()).toBe(200);
    expect(secondPageResponse.ok()).toBeTruthy();

    const secondPageBody = await secondPageResponse.json();

    expect(secondPageBody.current_page).toBe(2);
    expect(Array.isArray(secondPageBody.data)).toBeTruthy();
    expect(secondPageBody.data.length).toBeGreaterThan(0);

    expect(secondPageBody.data.length).toBeLessThanOrEqual(
      secondPageBody.per_page
    );

    expect(secondPageBody.total).toBe(responseBody.total);
    expect(secondPageBody.last_page).toBe(responseBody.last_page);
  }

  // Step 9: Print pagination summary
  console.log('Total Products:', responseBody.total);
  console.log('Total Pages:', responseBody.last_page);
  console.log('Products Per Page:', responseBody.per_page);

});
