
import "dotenv/config";
import { getTelegramWebhookInfo } from "../telegram-webhook";

getTelegramWebhookInfo()
    .then((info) => {
        console.log("Webhook Info:", JSON.stringify(info, null, 2));
    })
    .catch(console.error);
