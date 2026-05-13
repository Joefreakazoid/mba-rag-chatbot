import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract procedure path: /api/trpc/auth.me?batch=1 → "auth.me"
  const url = req.url ?? "/";
  const path = url.replace(/^\/api\/trpc\/?/, "").split("?")[0];

  await nodeHTTPRequestHandler({
    router: appRouter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createContext: createContext as any,
    req: req as any,
    res: res as any,
    path,
  });
}
