import type { IncomingMessage } from "http";

function isSecureRequest(req: IncomingMessage): boolean {
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export type SessionCookieOptions = {
  httpOnly: boolean;
  path: string;
  sameSite: "none" | "lax" | "strict";
  secure: boolean;
};

export function getSessionCookieOptions(req: IncomingMessage): SessionCookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}

export function buildSetCookieHeader(
  name: string,
  value: string,
  options: SessionCookieOptions & { maxAge?: number }
): string {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) {
    const maxAgeSeconds = options.maxAge <= 0 ? 0 : Math.floor(options.maxAge / 1000);
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}
