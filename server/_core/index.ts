import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleTelegramWebhook, registerTelegramWebhook, setAppUrl } from "../telegram-webhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Telegram webhook
  app.post("/api/telegram/webhook/:token", handleTelegramWebhook);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  let port: number;
  if (process.env.NODE_ENV === "production") {
    port = parseInt(process.env.PORT || "3000");
  } else {
    const preferredPort = parseInt(process.env.PORT || "3000");
    port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);

    // Auto-register Telegram webhook in production or if BOT_TOKEN is present
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || "8435304968:AAEe1nH8UmZ8leHBhnKl3EDhS4RRLGZY-Cc";
    const rawAppUrl = process.env.VITE_APP_URL || process.env.RENDER_EXTERNAL_URL || "https://ngfit-pro.bothost.ru";
    const appUrl = rawAppUrl.replace(/\/$/, "");

    setAppUrl(appUrl);
    const webhookUrl = `${appUrl}/api/telegram/webhook/${botToken}`;

    console.log(`Telegram Bot Token: ${botToken.substring(0, 10)}...`);
    console.log(`Registering Telegram webhook: ${webhookUrl}`);

    try {
      await registerTelegramWebhook(webhookUrl);
    } catch (err) {
      console.error("Failed to register Telegram webhook:", err);
    }
  });
}

startServer().catch(console.error);
