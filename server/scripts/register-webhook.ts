
import "dotenv/config";
import { registerTelegramWebhook } from "../telegram-webhook";

const url = process.argv[2];

if (!url) {
    console.error("Please provide a URL as an argument");
    console.error("Usage: npm run telegram:webhook <your-https-url>");
    process.exit(1);
}

// Ensure URL handles trailing slash for the webhook path
const webhookUrl = `${url.replace(/\/$/, "")}/api/telegram/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;

console.log(`Registering webhook for: ${webhookUrl}`);

registerTelegramWebhook(webhookUrl)
    .then((success) => {
        if (success) {
            console.log("✅ Webhook registered! Open your bot in Telegram.");
            process.exit(0);
        } else {
            console.error("❌ Failed to register webhook.");
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error("Error:", err);
        process.exit(1);
    });
