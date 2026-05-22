"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/api.ts
var api_exports = {};
__export(api_exports, {
  default: () => api_default
});
module.exports = __toCommonJS(api_exports);
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_express2 = require("@trpc/server/adapters/express");

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
var import_drizzle_orm = require("drizzle-orm");
var import_postgres_js = require("drizzle-orm/postgres-js");
var import_postgres = __toESM(require("postgres"), 1);

// drizzle/schema.ts
var import_pg_core = require("drizzle-orm/pg-core");
var roleEnum = (0, import_pg_core.pgEnum)("role", ["user", "admin"]);
var fileTypeEnum = (0, import_pg_core.pgEnum)("fileType", ["pdf", "text"]);
var messageRoleEnum = (0, import_pg_core.pgEnum)("messageRole", ["user", "assistant"]);
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  openId: (0, import_pg_core.varchar)("openId", { length: 64 }).notNull().unique(),
  name: (0, import_pg_core.text)("name"),
  email: (0, import_pg_core.varchar)("email", { length: 320 }),
  loginMethod: (0, import_pg_core.varchar)("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: (0, import_pg_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updatedAt").defaultNow().notNull(),
  lastSignedIn: (0, import_pg_core.timestamp)("lastSignedIn").defaultNow().notNull()
});
var documents = (0, import_pg_core.pgTable)("documents", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  fileName: (0, import_pg_core.varchar)("fileName", { length: 255 }).notNull(),
  fileType: fileTypeEnum("fileType").notNull(),
  storageKey: (0, import_pg_core.varchar)("storageKey", { length: 255 }).notNull(),
  storageUrl: (0, import_pg_core.text)("storageUrl").notNull(),
  chunkCount: (0, import_pg_core.integer)("chunkCount").default(0).notNull(),
  fileSizeBytes: (0, import_pg_core.integer)("fileSizeBytes"),
  metadata: (0, import_pg_core.jsonb)("metadata"),
  createdAt: (0, import_pg_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updatedAt").defaultNow().notNull()
});
var documentChunks = (0, import_pg_core.pgTable)("documentChunks", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  documentId: (0, import_pg_core.integer)("documentId").notNull(),
  chunkIndex: (0, import_pg_core.integer)("chunkIndex").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  pageNumber: (0, import_pg_core.integer)("pageNumber"),
  embedding: (0, import_pg_core.jsonb)("embedding"),
  createdAt: (0, import_pg_core.timestamp)("createdAt").defaultNow().notNull()
});
var conversations = (0, import_pg_core.pgTable)("conversations", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  sessionId: (0, import_pg_core.varchar)("sessionId", { length: 64 }).notNull().unique(),
  userId: (0, import_pg_core.integer)("userId"),
  title: (0, import_pg_core.varchar)("title", { length: 255 }),
  messageCount: (0, import_pg_core.integer)("messageCount").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updatedAt").defaultNow().notNull()
});
var messages = (0, import_pg_core.pgTable)("messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  conversationId: (0, import_pg_core.integer)("conversationId").notNull(),
  role: messageRoleEnum("role").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  sources: (0, import_pg_core.jsonb)("sources"),
  citations: (0, import_pg_core.jsonb)("citations"),
  createdAt: (0, import_pg_core.timestamp)("createdAt").defaultNow().notNull()
});

// server/db.ts
var _db = null;
function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = (0, import_postgres.default)(process.env.DATABASE_URL);
      _db = (0, import_postgres_js.drizzle)(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = { openId: user.openId };
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
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getDocuments() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(documents).orderBy(documents.createdAt);
}
async function createDocument(data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data).returning({ id: documents.id });
  return result[0];
}
async function deleteDocument(id) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(documents).where((0, import_drizzle_orm.eq)(documents.id, id));
}
async function getConversationBySessionId(sessionId) {
  const db = getDb();
  if (!db) return void 0;
  const result = await db.select().from(conversations).where((0, import_drizzle_orm.eq)(conversations.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createConversation(data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(conversations).values(data);
}
async function updateConversation(id, data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.update(conversations).set(data).where((0, import_drizzle_orm.eq)(conversations.id, id));
}
async function getConversationMessages(conversationId) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(messages).where((0, import_drizzle_orm.eq)(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}
async function createMessage(data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(data).returning({ id: messages.id });
  return result[0];
}
async function getDocumentChunks(documentId) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(documentChunks).where((0, import_drizzle_orm.eq)(documentChunks.documentId, documentId)).orderBy(documentChunks.chunkIndex);
}
async function createDocumentChunk(data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(documentChunks).values(data);
}
async function deleteDocumentChunks(documentId) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(documentChunks).where((0, import_drizzle_orm.eq)(documentChunks.documentId, documentId));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
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
function buildSetCookieHeader(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== void 0) {
    const maxAgeSeconds = options.maxAge <= 0 ? 0 : Math.floor(options.maxAge / 1e3);
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

// server/_core/env.ts
var ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  llmApiKey: process.env.LLM_API_KEY ?? "",
  llmBaseUrl: process.env.LLM_BASE_URL ?? "https://api.openai.com/v1",
  llmModel: process.env.LLM_MODEL ?? "gpt-4o-mini",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseKey: process.env.SUPABASE_KEY ?? "",
  supabaseBucket: process.env.SUPABASE_BUCKET ?? "documents"
};

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
var import_cookie = require("cookie");
var import_jose = require("jose");
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var SDKServer = class {
  parseCookies(cookieHeader) {
    if (!cookieHeader) return /* @__PURE__ */ new Map();
    const parsed = (0, import_cookie.parse)(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      { openId, appId: "local", name: options.name || "" },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new import_jose.SignJWT({
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
      const { payload } = await (0, import_jose.jwtVerify)(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return { openId, appId, name };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const user = await getUserByOpenId(session.openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getBodyField(req, key) {
  const value = req.body?.[key];
  return typeof value === "string" ? value : void 0;
}
function registerAuthRoutes(app2) {
  app2.get("/api/auth/debug", (req, res) => {
    res.json({
      env: {
        hasAdminEmail: !!ENV.adminEmail,
        adminEmailLength: ENV.adminEmail?.length || 0,
        adminEmailPrefix: ENV.adminEmail?.slice(0, 5) || "NOT SET",
        hasAdminPassword: !!ENV.adminPassword,
        adminPasswordLength: ENV.adminPassword?.length || 0,
        hasDatabaseUrl: !!ENV.databaseUrl,
        hasLlmApiKey: !!ENV.llmApiKey,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });
  app2.post("/api/auth/login", async (req, res) => {
    const email = getBodyField(req, "email");
    const password = getBodyField(req, "password");
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    if (!ENV.adminEmail || !ENV.adminPassword) {
      console.error("[Auth] Admin credentials not configured. ADMIN_EMAIL:", ENV.adminEmail ? "set" : "NOT SET");
      res.status(500).json({ error: "Admin credentials not configured" });
      return;
    }
    const submittedEmail = email.trim().toLowerCase();
    const submittedPassword = password.trim();
    const expectedEmail = ENV.adminEmail.trim().toLowerCase();
    const expectedPassword = ENV.adminPassword.trim();
    const emailMatch = submittedEmail === expectedEmail;
    const passwordMatch = submittedPassword === expectedPassword;
    console.log(`[Auth] Credentials comparison:`);
    console.log(`  submitted email: "${submittedEmail}" (length: ${submittedEmail.length})`);
    console.log(`  expected email:  "${expectedEmail}" (length: ${expectedEmail.length})`);
    console.log(`  submitted password length: ${submittedPassword.length}`);
    console.log(`  expected password length: ${expectedPassword.length}`);
    console.log(`  emailMatch: ${emailMatch}, passwordMatch: ${passwordMatch}`);
    if (!emailMatch || !passwordMatch) {
      const debugInfo = {
        emailMatch,
        passwordMatch,
        submittedEmailLen: submittedEmail.length,
        expectedEmailLen: expectedEmail.length,
        submittedPasswordLen: submittedPassword.length,
        expectedPasswordLen: expectedPassword.length
      };
      console.log("[Auth] Login failed with debug info:", debugInfo);
      res.status(401).json({ error: "Invalid credentials", debug: debugInfo });
      return;
    }
    try {
      const openId = `local:${email}`;
      await upsertUser({
        openId,
        name: "Admin",
        email,
        loginMethod: "password",
        role: "admin",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Login failed during session creation:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}

// server/storage.ts
var import_supabase_js = require("@supabase/supabase-js");
function getSupabaseClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseKey) {
    throw new Error("Storage not configured: set SUPABASE_URL and SUPABASE_KEY");
  }
  return (0, import_supabase_js.createClient)(ENV.supabaseUrl, ENV.supabaseKey);
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const client = getSupabaseClient();
  const key = appendHashSuffix(normalizeKey(relKey));
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.isBuffer(data) ? data : Buffer.from(data);
  const { error } = await client.storage.from(ENV.supabaseBucket).upload(key, buffer, { contentType, upsert: true });
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
  return { key, url: `/api/storage/${key}` };
}
async function storageGetSignedUrl(relKey) {
  const client = getSupabaseClient();
  const key = normalizeKey(relKey);
  const { data, error } = await client.storage.from(ENV.supabaseBucket).createSignedUrl(key, 3600);
  if (error || !data?.signedUrl) {
    throw new Error(`Failed to get signed URL: ${error?.message ?? "no URL returned"}`);
  }
  return data.signedUrl;
}

// server/_core/storageProxy.ts
function registerStorageProxy(app2) {
  app2.get("/api/storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    try {
      const signedUrl = await storageGetSignedUrl(key);
      res.set("Cache-Control", "no-store");
      res.redirect(307, signedUrl);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/_core/systemRouter.ts
var import_zod = require("zod");

// server/_core/notification.ts
var import_server = require("@trpc/server");
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new import_server.TRPCError({ code: "BAD_REQUEST", message: "Notification title is required." });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new import_server.TRPCError({ code: "BAD_REQUEST", message: "Notification content is required." });
  }
  const title = input.title.trim();
  const content = input.content.trim();
  if (title.length > TITLE_MAX_LENGTH) {
    throw new import_server.TRPCError({ code: "BAD_REQUEST", message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.` });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new import_server.TRPCError({ code: "BAD_REQUEST", message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.` });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  console.log(`[Notification] ${title}: ${content}`);
  return true;
}

// server/_core/trpc.ts
var import_server2 = require("@trpc/server");
var import_superjson = __toESM(require("superjson"), 1);
var t = import_server2.initTRPC.context().create({
  transformer: import_superjson.default
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new import_server2.TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
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
      throw new import_server2.TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
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
    import_zod.z.object({
      timestamp: import_zod.z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    import_zod.z.object({
      title: import_zod.z.string().min(1, "title is required"),
      content: import_zod.z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
var import_zod2 = require("zod");
var import_nanoid = require("nanoid");

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") return part;
  if (part.type === "image_url") return part;
  if (part.type === "file_url") return part;
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return { role, name, tool_call_id, content };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return { role, name, content: contentParts[0].text };
  }
  return { role, name, content: contentParts };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") return toolChoice;
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error("tool_choice 'required' was provided but no tools were configured");
    }
    if (tools.length > 1) {
      throw new Error("tool_choice 'required' needs a single tool or specify the tool name explicitly");
    }
    return { type: "function", function: { name: tools[0].function.name } };
  }
  if ("name" in toolChoice) {
    return { type: "function", function: { name: toolChoice.name } };
  }
  return toolChoice;
};
var resolveApiUrl = () => `${ENV.llmBaseUrl.replace(/\/$/, "")}/chat/completions`;
var assertApiKey = () => {
  if (!ENV.llmApiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error("responseFormat json_schema requires a defined schema object");
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages: messages2,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: ENV.llmModel,
    messages: messages2.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(toolChoice || tool_choice, tools);
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.llmApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/rag.ts
function chunkText(text2, chunkSize = 1e3, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text2.length) {
    const end = Math.min(start + chunkSize, text2.length);
    const chunk = text2.substring(start, end);
    if (chunk.trim()) {
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }
  return chunks;
}
async function generateEmbedding(text2) {
  try {
    const embedding = createSimpleEmbedding(text2);
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Array(384).fill(0);
  }
}
function createSimpleEmbedding(text2) {
  const embedding = new Array(384).fill(0);
  const words = text2.toLowerCase().split(/\s+/);
  words.forEach((word, wordIdx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash = hash & hash;
    }
    for (let i = 0; i < embedding.length; i++) {
      const idx = (wordIdx + i) % embedding.length;
      embedding[idx] += hash / 1e6 * Math.sin(i);
    }
  });
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  return embedding;
}
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}
async function retrieveRelevantChunks(query, chunks, topK = 5) {
  const queryEmbedding = await generateEmbedding(query);
  const scored = chunks.map((chunk) => {
    const chunkEmbedding = chunk.embedding || new Array(384).fill(0);
    const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
    return {
      id: chunk.id,
      content: chunk.content,
      similarity
    };
  }).sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  return scored;
}
async function generateRAGAnswer(query, relevantChunks) {
  const context = relevantChunks.map((chunk, idx) => `[Source ${idx + 1}]
${chunk.content}`).join("\n\n");
  const systemPrompt = `You are an MBA Class Assistant - an expert tutor helping students understand concepts from MBA class notes. 

Your role is to:
1. Answer questions based ONLY on the provided class notes and materials
2. Be clear, concise, and academic in your explanations
3. Always cite which source material you're referencing
4. If information is not in the provided materials, clearly state that

When answering, structure your response to be helpful and educational.`;
  const userPrompt = `Based on the following class materials, please answer this question:

Question: ${query}

Class Materials:
${context}

Please provide a clear, well-structured answer that cites the specific materials you're referencing.`;
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
    const content = response.choices[0]?.message?.content;
    const answer = typeof content === "string" ? content : "";
    const sourceMatches = answer.match(/\[Source \d+\]/g) || [];
    const sources = Array.from(new Set(sourceMatches));
    return {
      answer,
      sources
    };
  } catch (error) {
    console.error("Error generating RAG answer:", error);
    throw error;
  }
}
async function extractTextFromPDF(buffer) {
  try {
    const text2 = buffer.toString("utf-8");
    return text2;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw error;
  }
}
async function processDocument(fileBuffer, fileType) {
  let text2;
  if (fileType === "pdf") {
    text2 = await extractTextFromPDF(fileBuffer);
  } else {
    text2 = fileBuffer.toString("utf-8");
  }
  const chunks = chunkText(text2);
  const processedChunks = await Promise.all(
    chunks.map(async (content, idx) => ({
      content,
      embedding: await generateEmbedding(content),
      pageNumber: Math.floor(idx / 5) + 1
      // Rough page estimation
    }))
  );
  return processedChunks;
}

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const header = buildSetCookieHeader(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
      ctx.res.setHeader("Set-Cookie", header);
      return {
        success: true
      };
    })
  }),
  // ============ Document Management (Owner Only) ============
  documents: router({
    /**
     * List all uploaded documents
     */
    list: publicProcedure.query(async () => {
      return getDocuments();
    }),
    /**
     * Upload a new document (owner only)
     */
    upload: protectedProcedure.input(
      import_zod2.z.object({
        fileName: import_zod2.z.string().min(1),
        fileType: import_zod2.z.enum(["pdf", "text"]),
        fileBuffer: import_zod2.z.string()
        // Base64 encoded
      })
    ).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only the owner can upload documents");
      }
      try {
        const buffer = Buffer.from(input.fileBuffer, "base64");
        const processedChunks = await processDocument(buffer, input.fileType);
        const storageKey = `documents/${(0, import_nanoid.nanoid)()}/${input.fileName}`;
        const { url: storageUrl } = await storagePut(
          storageKey,
          buffer,
          input.fileType === "pdf" ? "application/pdf" : "text/plain"
        );
        const result = await createDocument({
          fileName: input.fileName,
          fileType: input.fileType,
          storageKey,
          storageUrl,
          chunkCount: processedChunks.length,
          fileSizeBytes: buffer.length,
          metadata: {
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
            uploadedBy: ctx.user.email
          }
        });
        const documentId = result.id;
        for (let i = 0; i < processedChunks.length; i++) {
          const chunk = processedChunks[i];
          await createDocumentChunk({
            documentId,
            chunkIndex: i,
            content: chunk.content,
            pageNumber: chunk.pageNumber,
            embedding: chunk.embedding
          });
        }
        return {
          success: true,
          documentId,
          chunkCount: processedChunks.length
        };
      } catch (error) {
        console.error("Error uploading document:", error);
        throw new Error("Failed to upload document");
      }
    }),
    /**
     * Delete a document (owner only)
     */
    delete: protectedProcedure.input(import_zod2.z.object({ documentId: import_zod2.z.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only the owner can delete documents");
      }
      try {
        await deleteDocumentChunks(input.documentId);
        await deleteDocument(input.documentId);
        return { success: true };
      } catch (error) {
        console.error("Error deleting document:", error);
        throw new Error("Failed to delete document");
      }
    })
  }),
  // ============ Chat & Conversation ============
  chat: router({
    /**
     * Get or create a conversation session
     */
    getOrCreateSession: publicProcedure.input(import_zod2.z.object({ sessionId: import_zod2.z.string().optional() })).query(async ({ input }) => {
      const sessionId = input.sessionId || (0, import_nanoid.nanoid)();
      let conversation = await getConversationBySessionId(sessionId);
      if (!conversation) {
        await createConversation({
          sessionId,
          title: "MBA Class Discussion",
          messageCount: 0
        });
        conversation = await getConversationBySessionId(sessionId);
      }
      return {
        sessionId,
        conversationId: conversation?.id,
        title: conversation?.title
      };
    }),
    /**
     * Get conversation history
     */
    getHistory: publicProcedure.input(import_zod2.z.object({ conversationId: import_zod2.z.number() })).query(async ({ input }) => {
      const messages2 = await getConversationMessages(input.conversationId);
      return messages2;
    }),
    /**
     * Send a message and get RAG-powered response
     */
    sendMessage: publicProcedure.input(
      import_zod2.z.object({
        conversationId: import_zod2.z.number(),
        message: import_zod2.z.string().min(1)
      })
    ).mutation(async ({ input }) => {
      try {
        await createMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message
        });
        const documents2 = await getDocuments();
        const allChunks = [];
        for (const doc of documents2) {
          const chunks = await getDocumentChunks(doc.id);
          for (const chunk of chunks) {
            allChunks.push({
              id: chunk.id,
              content: chunk.content,
              embedding: chunk.embedding,
              documentId: doc.id,
              documentName: doc.fileName
            });
          }
        }
        if (allChunks.length === 0) {
          const noDocsMessage = "I don't have any MBA class notes loaded yet. Please ask the owner to upload some documents first!";
          await createMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: noDocsMessage,
            sources: [],
            citations: []
          });
          return {
            success: true,
            answer: noDocsMessage,
            sources: [],
            messageId: 0
          };
        }
        const relevantChunksData = await retrieveRelevantChunks(
          input.message,
          allChunks,
          5
        );
        const relevantChunks = relevantChunksData.map((chunk) => {
          const fullChunk = allChunks.find((c) => c.id === chunk.id);
          return {
            content: chunk.content,
            documentId: fullChunk?.documentId,
            documentName: fullChunk?.documentName
          };
        });
        const { answer, sources } = await generateRAGAnswer(
          input.message,
          relevantChunks.map((c) => ({ content: c.content }))
        );
        const sourceDocuments = relevantChunks.slice(0, 3).map((chunk) => ({
          documentId: chunk.documentId,
          documentName: chunk.documentName,
          excerpt: chunk.content.substring(0, 200)
        }));
        const messageResult = await createMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: answer,
          sources: sourceDocuments,
          citations: sources
        });
        const conversation = await getConversationBySessionId(
          `conv-${input.conversationId}`
        );
        if (conversation) {
          await updateConversation(input.conversationId, {
            messageCount: (conversation.messageCount || 0) + 2
          });
        }
        return {
          success: true,
          answer,
          sources: sourceDocuments,
          messageId: messageResult.id
        };
      } catch (error) {
        console.error("Error processing chat message:", error);
        throw new Error("Failed to process message");
      }
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}

// server/api.ts
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerAuthRoutes(app);
app.use("/api/trpc", (0, import_express2.createExpressMiddleware)({ router: appRouter, createContext }));
var api_default = app;
