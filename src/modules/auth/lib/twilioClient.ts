import twilio from "twilio";
import { env } from "~/env";

// Check if we're using placeholder credentials (development mode)
const isDevMode =
    env.TWILIO_ACCOUNT_SID.includes("PLACEHOLDER") ||
    env.TWILIO_AUTH_TOKEN.includes("PLACEHOLDER");

let twilioClient: ReturnType<typeof twilio> | null = null;

if (!isDevMode) {
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

export async function sendSMS(to: string, body: string) {
    try {
        // Development mode: Just log to console
        if (isDevMode) {
            console.log("\n" + "=".repeat(60));
            console.log("📱 MOCK SMS (Development Mode)");
            console.log("=".repeat(60));
            console.log(`To: ${to}`);
            console.log(`Message: ${body}`);
            console.log("=".repeat(60) + "\n");

            return { success: true, messageId: "mock-message-id" };
        }

        // Production mode: Send real SMS
        const message = await twilioClient!.messages.create({
            body,
            from: env.TWILIO_PHONE_NUMBER,
            to,
        });

        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error("Twilio SMS Error:", error);
        return { success: false, error: "Failed to send SMS" };
    }
}
