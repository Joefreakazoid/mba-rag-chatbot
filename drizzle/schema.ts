import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, longtext, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documents table for storing uploaded MBA class notes and materials.
 * Only the owner can upload documents.
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  /** Original filename of the uploaded document */
  fileName: varchar("fileName", { length: 255 }).notNull(),
  /** File type: 'pdf' or 'text' */
  fileType: mysqlEnum("fileType", ["pdf", "text"]).notNull(),
  /** Storage key in S3 for the document */
  storageKey: varchar("storageKey", { length: 255 }).notNull(),
  /** URL to access the document */
  storageUrl: text("storageUrl").notNull(),
  /** Total number of chunks created from this document */
  chunkCount: int("chunkCount").default(0).notNull(),
  /** Document size in bytes */
  fileSizeBytes: int("fileSizeBytes"),
  /** Brief summary or metadata about the document */
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Document chunks table for RAG retrieval.
 * Each document is split into chunks for embedding and retrieval.
 */
export const documentChunks = mysqlTable("documentChunks", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the parent document */
  documentId: int("documentId").notNull(),
  /** Sequential chunk number within the document */
  chunkIndex: int("chunkIndex").notNull(),
  /** The actual text content of this chunk */
  content: longtext("content").notNull(),
  /** Page number (for PDFs) or section identifier */
  pageNumber: int("pageNumber"),
  /** Vector embedding for semantic search (stored as JSON array for MySQL compatibility) */
  embedding: json("embedding"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type InsertDocumentChunk = typeof documentChunks.$inferInsert;

/**
 * Conversations table for storing chat sessions.
 * Each user session has one conversation.
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  /** Session identifier (can be anonymous or tied to user) */
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  /** Optional: user ID if authenticated */
  userId: int("userId"),
  /** Conversation title/topic */
  title: varchar("title", { length: 255 }),
  /** Number of messages in this conversation */
  messageCount: int("messageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table for storing individual Q&A exchanges.
 * Each message in a conversation is stored with its role and content.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the parent conversation */
  conversationId: int("conversationId").notNull(),
  /** Message role: 'user' or 'assistant' */
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  /** The message content */
  content: longtext("content").notNull(),
  /** For assistant messages: array of source document IDs and chunk indices */
  sources: json("sources"),
  /** For assistant messages: array of source citations */
  citations: json("citations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;