import type { IncomingMessage, ServerResponse } from "http";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: IncomingMessage;
  res: ServerResponse;
  user: User | null;
};

export async function createContext(opts: {
  req: IncomingMessage;
  res: ServerResponse;
}): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}
