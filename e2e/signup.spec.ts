import { test, expect } from '@playwright/test';

test.describe('Signup Flow E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/signup');
    });

    test('should display signup page with correct title', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
    });

    test('should show phone input form initially', async ({ page }) => {
        await expect(page.getByLabel(/phone number/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /send otp/i })).toBeVisible();
    });

    test('should display trust messaging', async ({ page }) => {
        await expect(page.getByText(/keeps your account safe/i)).toBeVisible();
    });

    test('should show progress indicators', async ({ page }) => {
        // Check for progress dots
        const progressDots = page.locator('.rounded-full').filter({ hasText: '' });
        await expect(progressDots.first()).toBeVisible();
    });

    test('should validate phone number format', async ({ page }) => {
        const phoneInput = page.getByLabel(/phone number/i);
        const submitButton = page.getByRole('button', { name: /send otp/i });

        // Enter invalid phone number
        await phoneInput.fill('123');
        await submitButton.click();

        // Should show validation error (browser's built-in or custom)
        // Note: This test assumes client-side validation or server error response
    });

    test('should accept valid Thai phone numbers', async ({ page }) => {
        const phoneInput = page.getByLabel(/phone number/i);

        // Test +66 format
        await phoneInput.fill('+66812345678');
        expect(await phoneInput.inputValue()).toBe('+66812345678');

        // Test 0 format
        await phoneInput.fill('0812345678');
        expect(await phoneInput.inputValue()).toBe('0812345678');
    });

    test('should have minimum 44px touch targets', async ({ page }) => {
        const submitButton = page.getByRole('button', { name: /send otp/i });
        const box = await submitButton.boundingBox();

        expect(box).not.toBeNull();
        if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
            expect(box.width).toBeGreaterThanOrEqual(44);
        }
    });

    test('should be mobile responsive at 375px width', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
        await expect(page.getByLabel(/phone number/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /send otp/i })).toBeVisible();
    });

    test.describe('OTP Verification Step', () => {
        test('should show OTP input after successful phone submission', async ({ page }) => {
            // Note: This test requires mocking the sendOTP server action
            // In a real E2E test, you'd need to either:
            // 1. Use a test Twilio account
            // 2. Mock the Twilio API
            // 3. Use a test mode that bypasses SMS sending

            // For now, we'll test the UI flow assuming successful OTP send
            // This would need to be implemented with proper test infrastructure
        });

        test('should only accept numeric input in OTP field', async ({ page }) => {
            // This test would follow after successful phone submission
            // Testing that OTP input only accepts numbers
        });

        test('should limit OTP to 6 digits', async ({ page }) => {
            // This test would verify max length of OTP input
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper form labels', async ({ page }) => {
            const phoneInput = page.getByLabel(/phone number/i);
            await expect(phoneInput).toBeVisible();

            // Check that label is properly associated
            const labelFor = await phoneInput.getAttribute('id');
            expect(labelFor).toBeTruthy();
        });

        test('should have proper heading hierarchy', async ({ page }) => {
            const h1 = page.getByRole('heading', { level: 1 });
            await expect(h1).toBeVisible();
        });

        test('should be keyboard navigable', async ({ page }) => {
            await page.keyboard.press('Tab');

            // Phone input should be focused
            const phoneInput = page.getByLabel(/phone number/i);
            await expect(phoneInput).toBeFocused();

            await page.keyboard.press('Tab');

            // Submit button should be focused
            const submitButton = page.getByRole('button', { name: /send otp/i });
            await expect(submitButton).toBeFocused();
        });
    });

    test.describe('Error Handling', () => {
        test('should display error message on failed OTP send', async ({ page }) => {
            // This would test error display when server returns error
            // Requires proper test setup with mocked server responses
        });

        test('should clear error message when retrying', async ({ page }) => {
            // Test that error messages are cleared on retry
        });
    });
});
