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
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const email = getBodyField(req, "email");
    const password = getBodyField(req, "password");

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    if (!ENV.adminEmail || !ENV.adminPassword) {
      console.log("[Auth:debug] ADMIN_EMAIL configured:", false);
      res.status(500).json({ error: "Admin credentials not configured" });
      return;
    }

    console.log("[Auth:debug] ADMIN_EMAIL prefix:", ENV.adminEmail.slice(0, 3));
    console.log("[Auth:debug] submitted email prefix:", email.slice(0, 3));
    console.log("[Auth:debug] email match:", email === ENV.adminEmail);
    console.log("[Auth:debug] password match:", password === ENV.adminPassword);

    if (email !== ENV.adminEmail || password !== ENV.adminPassword) {
      res.status(401).json({ error: "Invalid credentials" });
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
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
