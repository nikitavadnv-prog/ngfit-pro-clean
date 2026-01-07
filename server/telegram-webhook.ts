import express, { Request, Response } from "express";
import { z } from "zod";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || "8435304968:AAEe1nH8UmZ8leHBhnKl3EDhS4RRLGZY-Cc";
let APP_URL = process.env.VITE_APP_URL || process.env.RENDER_EXTERNAL_URL || "https://ngfit-pro.bothost.ru";

/**
 * Set the application URL dynamically if needed
 */
export function setAppUrl(url: string) {
  APP_URL = url.replace(/\/$/, "");
}

/**
 * Telegram Update schema
 */
const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z
    .object({
      message_id: z.number(),
      from: z.object({
        id: z.number(),
        first_name: z.string(),
        username: z.string().optional(),
      }),
      chat: z.object({
        id: z.number(),
      }),
      text: z.string().optional(),
    })
    .optional(),
});

type TelegramUpdate = z.infer<typeof TelegramUpdateSchema>;

/**
 * Send message via Telegram API
 */
async function sendTelegramMessage(
  chatId: number,
  text: string,
  replyMarkup?: unknown
) {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    }
  );

  if (!response.ok) {
    console.error("Failed to send Telegram message:", response.statusText);
  }

  return response.json();
}

/**
 * Send Web App button
 */
async function sendWebAppButton(chatId: number) {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🏋️ <b>NGFit Pro</b>\n\nТренируйте своих клиентов эффективнее! Управляйте расписанием, упражнениями и клиентами в одном приложении.",
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Запустить NGFit Pro",
                web_app: {
                  url: APP_URL,
                },
              },
            ],
          ],
        },
      }),
    }
  );

  if (!response.ok) {
    console.error("Failed to send web app button:", response.statusText);
  }

  return response.json();
}

/**
 * Handle Telegram webhook updates
 */
export async function handleTelegramWebhook(req: Request, res: Response) {
  try {
    // Verify token from URL
    const token = req.params.token;
    if (token !== TELEGRAM_BOT_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const update = TelegramUpdateSchema.parse(req.body);

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || "";
      const firstName = update.message.from.first_name;

      // Handle /start command
      if (text === "/start") {
        123
        await sendTelegramMessage(chatId, `Привет, ${firstName}! \n\nДобро пожаловать в NGFit Pro – приложение для тренировок и здоровья!`, inlineKeyboard);
    );
      }

    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Register webhook with Telegram
 */
export async function registerTelegramWebhook(webhookUrl: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message"],
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✓ Telegram webhook registered successfully");
      console.log(`Webhook URL: ${webhookUrl}`);
      return true;
    } else {
      console.error("Failed to register webhook:", data.description);
      return false;
    }
  } catch (error) {
    console.error("Failed to register webhook:", error);
    return false;
  }
}

/**
 * Get webhook info
 */
export async function getTelegramWebhookInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );

    return await response.json();
  } catch (error) {
    console.error("Failed to get webhook info:", error);
    return null;
  }
}
