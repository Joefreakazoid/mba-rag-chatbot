import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

function getSupabaseClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseKey) {
    throw new Error("Storage not configured: set SUPABASE_URL and SUPABASE_KEY");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseKey);
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getSupabaseClient();
  const key = appendHashSuffix(normalizeKey(relKey));

  const buffer =
    typeof data === "string"
      ? Buffer.from(data)
      : Buffer.isBuffer(data)
        ? data
        : Buffer.from(data);

  const { error } = await client.storage
    .from(ENV.supabaseBucket)
    .upload(key, buffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return { key, url: `/api/storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/api/storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const client = getSupabaseClient();
  const key = normalizeKey(relKey);

  const { data, error } = await client.storage
    .from(ENV.supabaseBucket)
    .createSignedUrl(key, 3600);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to get signed URL: ${error?.message ?? "no URL returned"}`);
  }

  return data.signedUrl;
}
