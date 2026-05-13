import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  documents,
  conversations,
  messages,
  documentChunks,
  InsertDocument,
  InsertConversation,
  InsertMessage,
  InsertDocumentChunk,
  Document,
  Conversation,
  Message,
  DocumentChunk,
} from "../drizzle/schema";
let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Document Queries ============

export async function getDocuments(): Promise<Document[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).orderBy(documents.createdAt);
}

export async function getDocumentById(id: number): Promise<Document | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(documents).values(data);
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(documents).where(eq(documents.id, id));
}

// ============ Conversation Queries ============

export async function getConversationBySessionId(
  sessionId: string
): Promise<Conversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.sessionId, sessionId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createConversation(data: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(conversations).values(data);
}

export async function updateConversation(
  id: number,
  data: Partial<Conversation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(conversations).set(data).where(eq(conversations.id, id));
}

// ============ Message Queries ============

export async function getConversationMessages(
  conversationId: number
): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(messages).values(data);
}

// ============ Document Chunk Queries ============

export async function getDocumentChunks(
  documentId: number
): Promise<DocumentChunk[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentId, documentId))
    .orderBy(documentChunks.chunkIndex);
}

export async function createDocumentChunk(data: InsertDocumentChunk) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(documentChunks).values(data);
}

export async function deleteDocumentChunks(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(documentChunks)
    .where(eq(documentChunks.documentId, documentId));
}
