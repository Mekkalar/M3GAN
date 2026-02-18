import { validateThaiPhone, normalizeThaiPhone } from '../phoneUtils';

describe('Phone Utilities', () => {
    describe('validateThaiPhone', () => {
        it('should validate correct +66 format', () => {
            expect(validateThaiPhone('+66812345678')).toBe(true);
            expect(validateThaiPhone('+66987654321')).toBe(true);
        });

        it('should validate correct 0 format', () => {
            expect(validateThaiPhone('0812345678')).toBe(true);
            expect(validateThaiPhone('0987654321')).toBe(true);
        });

        it('should accept phone numbers with spaces', () => {
            expect(validateThaiPhone('+66 81 234 5678')).toBe(true);
            expect(validateThaiPhone('08 1234 5678')).toBe(true);
        });

        it('should accept phone numbers with dashes', () => {
            expect(validateThaiPhone('+66-81-234-5678')).toBe(true);
            expect(validateThaiPhone('08-1234-5678')).toBe(true);
        });

        it('should reject invalid formats', () => {
            expect(validateThaiPhone('1234567890')).toBe(false);
            expect(validateThaiPhone('+1234567890')).toBe(false);
            expect(validateThaiPhone('66812345678')).toBe(false);
        });

        it('should reject too short numbers', () => {
            expect(validateThaiPhone('+6681234567')).toBe(false);
            expect(validateThaiPhone('081234567')).toBe(false);
        });

        it('should reject too long numbers', () => {
            expect(validateThaiPhone('+668123456789')).toBe(false);
            expect(validateThaiPhone('08123456789')).toBe(false);
        });

        it('should reject empty string', () => {
            expect(validateThaiPhone('')).toBe(false);
        });

        it('should reject non-numeric characters', () => {
            expect(validateThaiPhone('+66abc123456')).toBe(false);
            expect(validateThaiPhone('0abc123456')).toBe(false);
        });
    });

    describe('normalizeThaiPhone', () => {
        it('should normalize +66 format to E.164', () => {
            expect(normalizeThaiPhone('+66812345678')).toBe('+66812345678');
        });

        it('should normalize 0 format to E.164', () => {
            expect(normalizeThaiPhone('0812345678')).toBe('+66812345678');
            expect(normalizeThaiPhone('0987654321')).toBe('+66987654321');
        });

        it('should remove spaces before normalization', () => {
            expect(normalizeThaiPhone('+66 81 234 5678')).toBe('+66812345678');
            expect(normalizeThaiPhone('08 1234 5678')).toBe('+66812345678');
        });

        it('should remove dashes before normalization', () => {
            expect(normalizeThaiPhone('+66-81-234-5678')).toBe('+66812345678');
            expect(normalizeThaiPhone('08-1234-5678')).toBe('+66812345678');
        });

        it('should throw error for invalid format', () => {
            expect(() => normalizeThaiPhone('1234567890')).toThrow('Invalid phone number format');
            expect(() => normalizeThaiPhone('+1234567890')).toThrow('Invalid phone number format');
        });

        it('should handle mixed spaces and dashes', () => {
            expect(normalizeThaiPhone('+66 81-234 5678')).toBe('+66812345678');
            expect(normalizeThaiPhone('08 1234-5678')).toBe('+66812345678');
        });
    });
});
