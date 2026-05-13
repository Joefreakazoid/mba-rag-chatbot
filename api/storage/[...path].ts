import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storageGetSignedUrl } from "../../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParam = req.query.path;
  const key = Array.isArray(pathParam) ? pathParam.join("/") : (pathParam ?? "");

  if (!key) {
    res.status(400).send("Missing storage key");
    return;
  }

  try {
    const signedUrl = await storageGetSignedUrl(key);
    res.setHeader("Cache-Control", "no-store");
    res.redirect(307, signedUrl);
  } catch (err) {
    console.error("[StorageProxy] failed:", err);
    res.status(502).send("Storage proxy error");
  }
}
