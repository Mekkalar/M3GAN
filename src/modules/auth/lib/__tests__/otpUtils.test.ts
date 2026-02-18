import { generateOTP, hashOTP, verifyOTP, createOTPExpiry } from '../otpUtils';

describe('OTP Utilities', () => {
    describe('generateOTP', () => {
        it('should generate a 6-digit OTP', () => {
            const otp = generateOTP();
            expect(otp).toMatch(/^\d{6}$/);
        });

        it('should generate different OTPs on consecutive calls', () => {
            const otp1 = generateOTP();
            const otp2 = generateOTP();
            // While technically they could be the same, probability is very low
            // This test might occasionally fail, but it's a good sanity check
            expect(otp1).not.toBe(otp2);
        });

        it('should generate OTP within valid range', () => {
            const otp = generateOTP();
            const numericOtp = parseInt(otp, 10);
            expect(numericOtp).toBeGreaterThanOrEqual(100000);
            expect(numericOtp).toBeLessThanOrEqual(999999);
        });
    });

    describe('hashOTP', () => {
        it('should hash an OTP code', async () => {
            const otp = '123456';
            const hashed = await hashOTP(otp);

            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(otp);
            expect(hashed.length).toBeGreaterThan(20); // bcrypt hashes are long
        });

        it('should generate different hashes for the same OTP', async () => {
            const otp = '123456';
            const hash1 = await hashOTP(otp);
            const hash2 = await hashOTP(otp);

            // bcrypt includes a salt, so hashes should be different
            expect(hash1).not.toBe(hash2);
        });
    });

    describe('verifyOTP', () => {
        it('should verify correct OTP', async () => {
            const otp = '123456';
            const hashed = await hashOTP(otp);
            const isValid = await verifyOTP(otp, hashed);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect OTP', async () => {
            const otp = '123456';
            const wrongOtp = '654321';
            const hashed = await hashOTP(otp);
            const isValid = await verifyOTP(wrongOtp, hashed);

            expect(isValid).toBe(false);
        });

        it('should reject empty OTP', async () => {
            const otp = '123456';
            const hashed = await hashOTP(otp);
            const isValid = await verifyOTP('', hashed);

            expect(isValid).toBe(false);
        });
    });

    describe('createOTPExpiry', () => {
        it('should create expiry 5 minutes in the future', () => {
            const now = new Date();
            const expiry = createOTPExpiry();

            const diffMs = expiry.getTime() - now.getTime();
            const diffMinutes = diffMs / (1000 * 60);

            expect(diffMinutes).toBeGreaterThan(4.9);
            expect(diffMinutes).toBeLessThan(5.1);
        });

        it('should return a Date object', () => {
            const expiry = createOTPExpiry();
            expect(expiry).toBeInstanceOf(Date);
        });
    });
});
