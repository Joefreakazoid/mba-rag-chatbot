import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as db from "../../server/db";
import { buildSetCookieHeader, getSessionCookieOptions } from "../../server/_core/cookies";
import { ENV } from "../../server/_core/env";
import { sdk } from "../../server/_core/sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body as Record<string, unknown> | undefined;
  const email = typeof body?.email === "string" ? body.email : undefined;
  const password = typeof body?.password === "string" ? body.password : undefined;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  if (!ENV.adminEmail || !ENV.adminPassword) {
    res.status(500).json({ error: "Admin credentials not configured" });
    return;
  }

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
    const cookieHeader = buildSetCookieHeader(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });
    res.setHeader("Set-Cookie", cookieHeader);
    res.json({ success: true });
  } catch (error) {
    console.error("[Auth] Login failed", error);
    res.status(500).json({ error: "Login failed" });
  }
}
