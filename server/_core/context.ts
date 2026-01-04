import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = opts.req.headers.authorization;

    if (authHeader) {
      // Parse Telegram initData
      const params = new URLSearchParams(authHeader);
      const userStr = params.get("user");

      if (userStr) {
        const tgUser = JSON.parse(userStr);
        const openId = String(tgUser.id);

        if (openId) {
          // Sync user to DB
          const insertData = {
            openId,
            name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username || "User",
            loginMethod: "telegram" as const, // Explicit cast
            role: undefined, // Role determines logic inside upsert
          };

          const { upsertUser, getUserByOpenId } = await import("../db");

          // Upsert and fetch fresh user data
          await upsertUser(insertData);
          const dbUser = await getUserByOpenId(openId);

          if (dbUser) {
            user = dbUser;
          }
        }
      }
    }

    // Fallback Mock ONLY if no auth header (for local pure browser dev without TG)
    if (!user && !authHeader) {
      console.log("No Auth Header - Using Demo User");
      user = {
        id: 1,
        openId: "demo_user",
        name: "Demo Trainer",
        email: "demo@ngfit.pro",
        loginMethod: "telegram",
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSignedIn: new Date().toISOString(),
      } as User;
    }
  } catch (error) {
    console.error("Auth error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
