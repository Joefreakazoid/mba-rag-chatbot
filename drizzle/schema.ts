import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const fileTypeEnum = pgEnum("fileType", ["pdf", "text"]);
export const messageRoleEnum = pgEnum("messageRole", ["user", "assistant"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: fileTypeEnum("fileType").notNull(),
  storageKey: varchar("storageKey", { length: 255 }).notNull(),
  storageUrl: text("storageUrl").notNull(),
  chunkCount: integer("chunkCount").default(0).notNull(),
  fileSizeBytes: integer("fileSizeBytes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const documentChunks = pgTable("documentChunks", {
  id: serial("id").primaryKey(),
  documentId: integer("documentId").notNull(),
  chunkIndex: integer("chunkIndex").notNull(),
  content: text("content").notNull(),
  pageNumber: integer("pageNumber"),
  embedding: jsonb("embedding"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type InsertDocumentChunk = typeof documentChunks.$inferInsert;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  userId: integer("userId"),
  title: varchar("title", { length: 255 }),
  messageCount: integer("messageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  sources: jsonb("sources"),
  citations: jsonb("citations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
