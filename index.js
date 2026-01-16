var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
var users, clients, exercises, schedules;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = sqliteTable("users", {
      /**
       * Surrogate primary key. Auto-incremented numeric value managed by the database.
       * Use this for relations between tables.
       */
      id: integer("id").primaryKey({ autoIncrement: true }),
      /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
      openId: text("openId").notNull().unique(),
      name: text("name"),
      email: text("email"),
      loginMethod: text("loginMethod"),
      role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
      createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
      updatedAt: text("updatedAt").default("CURRENT_TIMESTAMP").notNull(),
      lastSignedIn: text("lastSignedIn").default("CURRENT_TIMESTAMP").notNull()
    });
    clients = sqliteTable("clients", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: integer("userId").notNull(),
      name: text("name").notNull(),
      phone: text("phone"),
      email: text("email"),
      birthDate: text("birthDate"),
      experience: text("experience"),
      injuries: text("injuries"),
      contraindications: text("contraindications"),
      chronicDiseases: text("chronicDiseases"),
      badHabits: text("badHabits"),
      createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
      updatedAt: text("updatedAt").default("CURRENT_TIMESTAMP").notNull()
    });
    exercises = sqliteTable("exercises", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: integer("userId").notNull(),
      name: text("name").notNull(),
      description: text("description"),
      sets: integer("sets"),
      reps: text("reps"),
      weight: text("weight"),
      createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
      updatedAt: text("updatedAt").default("CURRENT_TIMESTAMP").notNull()
    });
    schedules = sqliteTable("schedules", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: integer("userId").notNull(),
      clientId: integer("clientId"),
      exerciseId: integer("exerciseId"),
      date: text("date").notNull(),
      time: text("time"),
      notes: text("notes"),
      completed: integer("completed").default(0),
      createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
      updatedAt: text("updatedAt").default("CURRENT_TIMESTAMP").notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  getDb: () => getDb,
  getUserByOpenId: () => getUserByOpenId,
  upsertUser: () => upsertUser
});
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
async function getDb() {
  return db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = (/* @__PURE__ */ new Date()).toISOString();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = (/* @__PURE__ */ new Date()).toISOString();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = (/* @__PURE__ */ new Date()).toISOString();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
var dbPath, client, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    dbPath = process.env.DATABASE_URL || "file:sqlite.db";
    if (dbPath === "sqlite.db") {
      dbPath = "file:sqlite.db";
    }
    client = createClient({ url: dbPath });
    db = drizzle(client);
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client2) {
    this.client = client2;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client2 = createOAuthHttpClient()) {
    this.client = client2;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = (/* @__PURE__ */ new Date()).toISOString();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: (/* @__PURE__ */ new Date()).toISOString()
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: (/* @__PURE__ */ new Date()).toISOString()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/telegram.ts
import { z as z2 } from "zod";
var TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
async function sendTelegramMessage(userId, message) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: userId,
        text: message,
        parse_mode: "HTML"
      })
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
var telegramRouter = router({
  /**
   * Send notification about workout
   */
  notifyWorkout: protectedProcedure.input(
    z2.object({
      workoutName: z2.string(),
      time: z2.string(),
      clientName: z2.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    if (!ctx.user.id) {
      throw new Error("User ID not found");
    }
    const message = `
\u{1F3CB}\uFE0F <b>\u041D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0435 \u043E \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0435</b>

<b>\u0423\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435:</b> ${input.workoutName}
<b>\u0412\u0440\u0435\u043C\u044F:</b> ${input.time}
${input.clientName ? `<b>\u041A\u043B\u0438\u0435\u043D\u0442:</b> ${input.clientName}` : ""}

\u0413\u043E\u0442\u043E\u0432\u044B \u043A \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0435? \u{1F4AA}
      `.trim();
    return sendTelegramMessage(ctx.user.id, message);
  }),
  /**
   * Sync all user data to Telegram
   */
  syncAllData: protectedProcedure.input(
    z2.object({
      clients: z2.array(z2.unknown()).optional(),
      exercises: z2.array(z2.unknown()).optional(),
      schedule: z2.array(z2.unknown()).optional(),
      profile: z2.unknown().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    if (!ctx.user.id) {
      throw new Error("User ID not found");
    }
    const summary = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      clientsCount: input.clients?.length || 0,
      exercisesCount: input.exercises?.length || 0,
      scheduleCount: input.schedule?.length || 0,
      profile: input.profile
    };
    const message = `
<b>\u{1F4CA} NGFit Pro - \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0434\u0430\u043D\u043D\u044B\u0445</b>

<b>\u041A\u043B\u0438\u0435\u043D\u0442\u043E\u0432:</b> ${summary.clientsCount}
<b>\u0423\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0439:</b> ${summary.exercisesCount}
<b>\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043E\u043A \u0432 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0438:</b> ${summary.scheduleCount}

<b>\u0412\u0440\u0435\u043C\u044F \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u0438:</b> ${(/* @__PURE__ */ new Date()).toLocaleString("ru-RU")}

\u2705 \u0412\u0441\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u044B \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B!
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
          botName: data.result.first_name
        };
      }
      return { ok: false, message: "Failed to get bot info" };
    } catch (error) {
      console.error("Failed to get bot status:", error);
      return { ok: false, message: "Error checking bot status" };
    }
  })
});

// server/routers/fitness.ts
import { z as z3 } from "zod";
init_db();
init_schema();
import { eq as eq2, and } from "drizzle-orm";
var fitnessRouter = router({
  // Clients
  getClients: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) return [];
    return await db2.select().from(clients).where(eq2(clients.userId, ctx.user.id));
  }),
  createClient: publicProcedure.input(z3.object({
    name: z3.string(),
    phone: z3.string().optional(),
    email: z3.string().optional(),
    birthDate: z3.string().optional(),
    experience: z3.string().optional(),
    injuries: z3.string().optional(),
    contraindications: z3.string().optional(),
    chronicDiseases: z3.string().optional(),
    badHabits: z3.string().optional()
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.insert(clients).values({
      userId: ctx.user.id,
      ...input
    });
    return result;
  }),
  updateClient: publicProcedure.input(z3.object({
    id: z3.number(),
    name: z3.string().optional(),
    phone: z3.string().optional(),
    email: z3.string().optional(),
    birthDate: z3.string().optional(),
    experience: z3.string().optional(),
    injuries: z3.string().optional(),
    contraindications: z3.string().optional(),
    chronicDiseases: z3.string().optional(),
    badHabits: z3.string().optional()
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { id, ...data } = input;
    await db2.update(clients).set(data).where(and(eq2(clients.id, id), eq2(clients.userId, ctx.user.id)));
    return { success: true };
  }),
  deleteClient: publicProcedure.input(z3.number()).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(clients).where(and(eq2(clients.id, input), eq2(clients.userId, ctx.user.id)));
    return { success: true };
  }),
  // Exercises
  getExercises: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) return [];
    return await db2.select().from(exercises).where(eq2(exercises.userId, ctx.user.id));
  }),
  createExercise: publicProcedure.input(z3.object({
    name: z3.string(),
    description: z3.string().optional(),
    sets: z3.number().optional(),
    reps: z3.string().optional(),
    weight: z3.string().optional()
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.insert(exercises).values({
      userId: ctx.user.id,
      ...input
    });
    return result;
  }),
  updateExercise: publicProcedure.input(z3.object({
    id: z3.number(),
    name: z3.string().optional(),
    description: z3.string().optional(),
    sets: z3.number().optional(),
    reps: z3.string().optional(),
    weight: z3.string().optional()
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { id, ...data } = input;
    await db2.update(exercises).set(data).where(and(eq2(exercises.id, id), eq2(exercises.userId, ctx.user.id)));
    return { success: true };
  }),
  deleteExercise: publicProcedure.input(z3.number()).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(exercises).where(and(eq2(exercises.id, input), eq2(exercises.userId, ctx.user.id)));
    return { success: true };
  }),
  // Schedules
  getSchedules: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) return [];
    return await db2.select().from(schedules).where(eq2(schedules.userId, ctx.user.id));
  }),
  createSchedule: publicProcedure.input(z3.object({
    clientId: z3.number().optional(),
    exerciseId: z3.number().optional(),
    date: z3.string(),
    time: z3.string().optional(),
    notes: z3.string().optional()
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.insert(schedules).values({
      userId: ctx.user.id,
      ...input
    });
    return result;
  }),
  updateSchedule: publicProcedure.input(z3.object({
    id: z3.number(),
    clientId: z3.number().optional(),
    exerciseId: z3.number().optional(),
    date: z3.string().optional(),
    time: z3.string().optional(),
    notes: z3.string().optional(),
    completed: z3.number().optional()
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { id, ...data } = input;
    await db2.update(schedules).set(data).where(and(eq2(schedules.id, id), eq2(schedules.userId, ctx.user.id)));
    return { success: true };
  }),
  deleteSchedule: publicProcedure.input(z3.number()).mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(schedules).where(and(eq2(schedules.id, input), eq2(schedules.userId, ctx.user.id)));
    return { success: true };
  }),
  // Public Onboarding Flow
  submitOnboarding: publicProcedure.input(z3.object({
    trainerId: z3.number(),
    name: z3.string(),
    phone: z3.string().optional(),
    email: z3.string().optional(),
    birthDate: z3.string().optional(),
    experience: z3.string().optional(),
    injuries: z3.string().optional(),
    contraindications: z3.string().optional(),
    chronicDiseases: z3.string().optional(),
    badHabits: z3.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { trainerId, ...data } = input;
    const result = await db2.insert(clients).values({
      userId: trainerId,
      ...data
    });
    return result;
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  telegram: telegramRouter,
  fitness: fitnessRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  })
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    const authHeader = opts.req.headers.authorization;
    if (authHeader) {
      const params = new URLSearchParams(authHeader);
      const userStr = params.get("user");
      if (userStr) {
        const tgUser = JSON.parse(userStr);
        const openId = String(tgUser.id);
        if (openId) {
          const insertData = {
            openId,
            name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username || "User",
            loginMethod: "telegram",
            // Explicit cast
            role: void 0
            // Role determines logic inside upsert
          };
          const { upsertUser: upsertUser2, getUserByOpenId: getUserByOpenId2 } = await Promise.resolve().then(() => (init_db(), db_exports));
          await upsertUser2(insertData);
          const dbUser = await getUserByOpenId2(openId);
          if (dbUser) {
            user = dbUser;
          }
        }
      }
    }
    if (!user && !authHeader) {
      console.log("No Auth Header - Using Demo User");
      user = {
        id: 1,
        openId: "demo_user",
        name: "Demo Trainer",
        email: "demo@ngfit.pro",
        loginMethod: "telegram",
        role: "admin",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastSignedIn: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  } catch (error) {
    console.error("Auth error:", error);
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
var plugins = [react(), tailwindcss()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/telegram-webhook.ts
import { z as z4 } from "zod";
var TELEGRAM_BOT_TOKEN2 = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || "8435304968:AAEe1nH8UmZ8leHBhnKl3EDhS4RRLGZY-Cc";
var APP_URL = process.env.VITE_APP_URL || process.env.RENDER_EXTERNAL_URL || "https://ngfit-pro.bothost.ru";
function setAppUrl(url) {
  APP_URL = url.replace(/\/$/, "");
}
var TelegramUpdateSchema = z4.object({
  update_id: z4.number(),
  message: z4.object({
    message_id: z4.number(),
    from: z4.object({
      id: z4.number(),
      first_name: z4.string(),
      username: z4.string().optional()
    }),
    chat: z4.object({
      id: z4.number()
    }),
    text: z4.string().optional()
  }).optional()
});
async function sendWebAppButton(chatId) {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN2}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "\u{1F3CB}\uFE0F <b>NGFit Pro</b>\n\n\u0422\u0440\u0435\u043D\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u0432\u043E\u0438\u0445 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0435\u0435! \u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439\u0442\u0435 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435\u043C, \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F\u043C\u0438 \u0438 \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C\u0438 \u0432 \u043E\u0434\u043D\u043E\u043C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438.",
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "\u{1F680} \u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C NGFit Pro",
                web_app: {
                  url: APP_URL
                }
              }
            ]
          ]
        }
      })
    }
  );
  if (!response.ok) {
    console.error("Failed to send web app button:", response.statusText);
  }
  return response.json();
}
async function handleTelegramWebhook(req, res) {
  try {
    const token = req.params.token;
    if (token !== TELEGRAM_BOT_TOKEN2) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const update = TelegramUpdateSchema.parse(req.body);
    if (update.message) {
      const chatId = update.message.chat.id;
      const text2 = update.message.text || "";
      const firstName = update.message.from.first_name;
      if (text2 === "/start") {
        await sendWebAppButton(chatId);
      }
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function registerTelegramWebhook(webhookUrl) {
  if (!TELEGRAM_BOT_TOKEN2) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN2}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message"]
        })
      }
    );
    const data = await response.json();
    if (data.ok) {
      console.log("\u2713 Telegram webhook registered successfully");
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

// server/_core/index.ts
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await 999(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.post("/api/telegram/webhook/:token", handleTelegramWebhook);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serve24(app);
  }
  let port;
  if (process.env.NODE_ENV === "production") {
    port = parseInt(process.env.PORT || "3000");
  } else {
    const preferredPort = parseInt(process.env.PORT || "3000");
    port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
  }
  app.get("/", (req, res) => {
    res.type("text/html").send('<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>NGFit Pro</title><style>*{margin:0;padding:0}.body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#667eea,#764ba2)}.card{background:white;padding:40px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.2);text-align:center;max-width:400px}h1{color:#333;margin:10px 0;font-size:32px}p{color:#666;margin:10px 0}.btn{padding:12px 30px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:5px;cursor:pointer;font-size:16px;font-weight:600;margin-top:20px}.status{margin-top:20px;padding:10px;background:#f0f0f0;border-radius:5px;color:#27ae60;font-weight:600}</style></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#667eea,#764ba2)"><div class="card"><h1>NGFit Pro</h1><p>Personal Training Management Bot</p><p>Manage your training clients and exercises efficiently</p><button class="btn" onclick="openTelegram()">Open in Telegram</button><div class="status">Bot is online</div></div><script>function openTelegram(){window.location.href="https://t.me/NGFit186"}</script></body></html>');
  });
  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
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
