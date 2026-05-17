import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function getBodyField(req: Request, key: string): string | undefined {
  const value = (req.body as Record<string, unknown>)?.[key];
  return typeof value === "string" ? value : undefined;
}

export function registerAuthRoutes(app: Express) {
  // Debug endpoint to check environment variables
  app.get("/api/auth/debug", (req: Request, res: Response) => {
    res.json({
      env: {
        hasAdminEmail: !!ENV.adminEmail,
        adminEmailLength: ENV.adminEmail?.length || 0,
        adminEmailPrefix: ENV.adminEmail?.slice(0, 5) || "NOT SET",
        hasAdminPassword: !!ENV.adminPassword,
        adminPasswordLength: ENV.adminPassword?.length || 0,
        hasDatabaseUrl: !!ENV.databaseUrl,
        hasLlmApiKey: !!ENV.llmApiKey,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
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
        expectedPasswordLen: expectedPassword.length,
      };
      console.log("[Auth] Login failed with debug info:", debugInfo);
      res.status(401).json({ error: "Invalid credentials", debug: debugInfo });
      return;
    }

    try {
      const openId = `local:${email}`;

      await db.upsertUser({
        openId,
        name: "Admin",
        email,
        loginMethod: "password",
        role: "admin",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS,
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
