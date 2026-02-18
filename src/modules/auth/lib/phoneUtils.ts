/**
 * Validate Thai mobile phone number format
 * Accepts: +66XXXXXXXXX or 0XXXXXXXXX
 */
export function validateThaiPhone(phone: string): boolean {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, "");

    // Check for +66 format (10 digits after +66)
    if (cleaned.startsWith("+66")) {
        return /^\+66[0-9]{9}$/.test(cleaned);
    }

    // Check for 0 format (10 digits starting with 0)
    if (cleaned.startsWith("0")) {
        return /^0[0-9]{9}$/.test(cleaned);
    }

    return false;
}

/**
 * Normalize Thai phone number to E.164 format (+66XXXXXXXXX)
 */
export function normalizeThaiPhone(phone: string): string {
    const cleaned = phone.replace(/[\s-]/g, "");

    if (cleaned.startsWith("+66")) {
        return cleaned;
    }

    if (cleaned.startsWith("0")) {
        return `+66${cleaned.slice(1)}`;
    }

    throw new Error("Invalid phone number format");
}
