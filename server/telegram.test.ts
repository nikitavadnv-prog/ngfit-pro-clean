import { describe, expect, it } from "vitest";

describe("Telegram Bot Token Validation", () => {
  it("should validate telegram bot token format", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    // Token should exist
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
    
    // Token format: BOT_ID:BOT_TOKEN
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
    
    // Should have correct structure
    const [botId, botToken] = token!.split(":");
    expect(botId).toBeTruthy();
    expect(botToken).toBeTruthy();
    expect(botId.length).toBeGreaterThan(0);
    expect(botToken.length).toBeGreaterThan(0);
  });

  it("should be able to call telegram bot api with token", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      console.warn("TELEGRAM_BOT_TOKEN not set, skipping API test");
      return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
        method: "GET",
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty("ok");
      expect(data.ok).toBe(true);
      expect(data).toHaveProperty("result");
      expect(data.result).toHaveProperty("id");
      expect(data.result).toHaveProperty("is_bot");
      expect(data.result.is_bot).toBe(true);
      
      console.log("✓ Telegram Bot Token is valid");
      console.log(`Bot ID: ${data.result.id}`);
      console.log(`Bot Username: @${data.result.username}`);
    } catch (error) {
      console.error("Failed to validate Telegram token:", error);
      throw error;
    }
  });
});
