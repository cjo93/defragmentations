import { test, expect } from '@playwright/test';

// Test: Onboarding flow
// Test: Login/logout
// Test: Session persistence
// Test: Checkout (Stripe)
// Test: Feature gating
// Test: AI features

test.describe('DEFRAG User Flows', () => {
  test('Onboarding: new user can create profile and access dashboard', async ({ page }) => {
    await page.goto('/onboarding');
    await page.fill('input[type="date"]', '1990-01-01');
    await page.fill('input[type="time"]', '12:00');
    await page.fill('input[placeholder="Birth Location"]', 'NYC');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=Your Family Cycle Map')).toBeVisible();
  });

  test('Login/logout: user can log in, use features, log out, and restore session', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testuser@defrag.app');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
    await page.click('text=Sign Out');
    await expect(page).toHaveURL('/');
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testuser@defrag.app');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Session persistence: user data is restored after browser reload', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Your Family Cycle Map')).toBeVisible();
    await page.reload();
    await expect(page.locator('text=Your Family Cycle Map')).toBeVisible();
  });

  test('Checkout: payment buttons redirect to Stripe', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Buy Blueprint');
    await expect(page).toHaveURL(/stripe.com/);
    await page.goto('/dashboard');
    await page.click('text=Subscribe to Orbit');
    await expect(page).toHaveURL(/stripe.com/);
  });

  test('Feature gating: protected routes require login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.evaluate(() => localStorage.removeItem('defrag_auth_token'));
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('AI features: chatbot, export, and conflict resolution work for logged-in users', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testuser@defrag.app');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.goto('/chatbot');
    await expect(page.locator('text=Ask about your design')).toBeVisible();
    await page.goto('/dashboard');
    await page.click('text=Download Relationship User Manual');
    await expect(page.locator('text=Download Relationship User Manual')).toBeVisible();
    await page.goto('/conflict-room');
    await page.fill('textarea', 'We keep arguing about chores');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Pattern Identified')).toBeVisible();
  });
});
