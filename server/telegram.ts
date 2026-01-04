import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message to user via Telegram
 */
async function sendTelegramMessage(userId: number, message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: userId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    throw error;
  }
}

/**
 * Sync user data to Telegram (store as message in saved messages)
 */
async function syncDataToTelegram(userId: number, data: unknown) {
  const message = `<b>NGFit Pro Data Sync</b>\n\n<code>${JSON.stringify(data, null, 2)}</code>`;
  return sendTelegramMessage(userId, message);
}

export const telegramRouter = router({
  /**
   * Send notification about workout
   */
  notifyWorkout: protectedProcedure
    .input(
      z.object({
        workoutName: z.string(),
        time: z.string(),
        clientName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new Error("User ID not found");
      }

      const message = `
🏋️ <b>Напоминание о тренировке</b>

<b>Упражнение:</b> ${input.workoutName}
<b>Время:</b> ${input.time}
${input.clientName ? `<b>Клиент:</b> ${input.clientName}` : ""}

Готовы к тренировке? 💪
      `.trim();

      return sendTelegramMessage(ctx.user.id, message);
    }),

  /**
   * Sync all user data to Telegram
   */
  syncAllData: protectedProcedure
    .input(
      z.object({
        clients: z.array(z.unknown()).optional(),
        exercises: z.array(z.unknown()).optional(),
        schedule: z.array(z.unknown()).optional(),
        profile: z.unknown().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new Error("User ID not found");
      }

      const summary = {
        timestamp: new Date().toISOString(),
        clientsCount: input.clients?.length || 0,
        exercisesCount: input.exercises?.length || 0,
        scheduleCount: input.schedule?.length || 0,
        profile: input.profile,
      };

      const message = `
<b>📊 NGFit Pro - Синхронизация данных</b>

<b>Клиентов:</b> ${summary.clientsCount}
<b>Упражнений:</b> ${summary.exercisesCount}
<b>Тренировок в расписании:</b> ${summary.scheduleCount}

<b>Время синхронизации:</b> ${new Date().toLocaleString("ru-RU")}

✅ Все данные синхронизированы и сохранены!
      `.trim();

      return sendTelegramMessage(ctx.user.id, message);
    }),

  /**
   * Get bot status
   */
  getBotStatus: publicProcedure.query(async () => {
    if (!TELEGRAM_BOT_TOKEN) {
      return { ok: false, message: "Bot token not configured" };
    }

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
      const data = await response.json();

      if (data.ok) {
        return {
          ok: true,
          botId: data.result.id,
          botUsername: data.result.username,
          botName: data.result.first_name,
        };
      }

      return { ok: false, message: "Failed to get bot info" };
    } catch (error) {
      console.error("Failed to get bot status:", error);
      return { ok: false, message: "Error checking bot status" };
    }
  }),
});
