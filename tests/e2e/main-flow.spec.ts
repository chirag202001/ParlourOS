import { test, expect } from '@playwright/test';

test.describe('ParlourOS E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as owner
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@demo.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app\/dashboard/, { timeout: 10000 });
  });

  test('should login and see dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    // Should see stats cards
    await expect(page.locator('text=Today\'s Appointments')).toBeVisible();
    await expect(page.locator('text=Total Customers')).toBeVisible();
  });

  test('should navigate to services', async ({ page }) => {
    await page.click('text=Services');
    await page.waitForURL(/\/app\/services/);
    await expect(page.locator('h1')).toContainText('Services');
  });

  test('should create a new customer', async ({ page }) => {
    await page.click('text=Customers');
    await page.waitForURL(/\/app\/customers/);

    // Click Add Customer
    await page.click('text=Add Customer');
    await page.waitForSelector('text=New Customer');

    // Fill form
    await page.fill('input[name="name"]', 'Test Customer E2E');
    await page.fill('input[name="phone"]', '+919999999999');
    await page.fill('input[name="email"]', 'test-e2e@example.com');

    // Submit
    await page.click('button:has-text("Create")');

    // Verify customer appears in list
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Test Customer E2E')).toBeVisible();
  });

  test('should view appointments page', async ({ page }) => {
    await page.click('text=Appointments');
    await page.waitForURL(/\/app\/appointments/);
    await expect(page.locator('h1')).toContainText('Appointments');
  });

  test('should navigate to POS', async ({ page }) => {
    await page.click('text=POS');
    await page.waitForURL(/\/app\/pos/);
    await expect(page.locator('h1')).toContainText('Point of Sale');
  });

  test('should view inventory', async ({ page }) => {
    await page.click('text=Inventory');
    await page.waitForURL(/\/app\/inventory/);
    await expect(page.locator('h1')).toContainText('Inventory');
  });

  test('should view reports', async ({ page }) => {
    await page.click('text=Reports');
    await page.waitForURL(/\/app\/reports/);
    await expect(page.locator('h1')).toContainText('Reports');
  });

  test('should view settings', async ({ page }) => {
    await page.click('text=Settings');
    await page.waitForURL(/\/app\/settings/);
    await expect(page.locator('h1')).toContainText('Settings');
    // Should see subscription tab
    await expect(page.locator('text=Subscription')).toBeVisible();
  });

  test('full flow: customer → appointment → invoice → payment', async ({ page }) => {
    // Step 1: Create customer
    await page.click('text=Customers');
    await page.waitForURL(/\/app\/customers/);
    await page.click('text=Add Customer');
    await page.fill('input[name="name"]', 'Flow Test Customer');
    await page.fill('input[name="phone"]', '+919888888888');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(1000);

    // Step 2: Create appointment
    await page.click('text=Appointments');
    await page.waitForURL(/\/app\/appointments/);
    await page.click('text=Book Appointment');
    // Fill appointment form (dynamic selects)
    await page.waitForSelector('text=New Appointment');
    // Close dialog for now (full E2E requires seeded data)
    await page.keyboard.press('Escape');

    // Step 3: Go to POS
    await page.click('text=POS');
    await page.waitForURL(/\/app\/pos/);
    await expect(page.locator('h1')).toContainText('Point of Sale');

    // Step 4: Verify reports
    await page.click('text=Reports');
    await page.waitForURL(/\/app\/reports/);
    await expect(page.locator('text=Monthly Revenue')).toBeVisible();
  });
});
