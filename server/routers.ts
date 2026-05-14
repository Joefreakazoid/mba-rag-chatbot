import { COOKIE_NAME } from "@shared/const";
import { buildSetCookieHeader, getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  getDocuments,
  createDocument,
  deleteDocument,
  getConversationBySessionId,
  createConversation,
  updateConversation,
  getConversationMessages,
  createMessage,
  getDocumentChunks,
  createDocumentChunk,
  deleteDocumentChunks,
} from "./db";
import { processDocument, retrieveRelevantChunks, generateRAGAnswer } from "./rag";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const header = buildSetCookieHeader(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
      ctx.res.setHeader("Set-Cookie", header);
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Document Management (Owner Only) ============
  documents: router({
    /**
     * List all uploaded documents
     */
    list: publicProcedure.query(async () => {
      return getDocuments();
    }),

    /**
     * Upload a new document (owner only)
     */
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          fileType: z.enum(["pdf", "text"]),
          fileBuffer: z.string(), // Base64 encoded
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only owner can upload documents
        if (ctx.user.role !== "admin") {
          throw new Error("Only the owner can upload documents");
        }

        try {
          // Decode base64 file
          const buffer = Buffer.from(input.fileBuffer, "base64");

          // Process document: extract text, chunk, and generate embeddings
          const processedChunks = await processDocument(buffer, input.fileType);

          // Upload file to storage
          const storageKey = `documents/${nanoid()}/${input.fileName}`;
          const { url: storageUrl } = await storagePut(
            storageKey,
            buffer,
            input.fileType === "pdf" ? "application/pdf" : "text/plain"
          );

          // Create document record
          const result = await createDocument({
            fileName: input.fileName,
            fileType: input.fileType,
            storageKey,
            storageUrl,
            chunkCount: processedChunks.length,
            fileSizeBytes: buffer.length,
            metadata: {
              uploadedAt: new Date().toISOString(),
              uploadedBy: ctx.user.email,
            },
          });

          const documentId = result.id;

          // Store chunks in database
          for (let i = 0; i < processedChunks.length; i++) {
            const chunk = processedChunks[i];
            await createDocumentChunk({
              documentId,
              chunkIndex: i,
              content: chunk.content,
              pageNumber: chunk.pageNumber,
              embedding: chunk.embedding as any,
            });
          }

          return {
            success: true,
            documentId,
            chunkCount: processedChunks.length,
          };
        } catch (error) {
          console.error("Error uploading document:", error);
          throw new Error("Failed to upload document");
        }
      }),

    /**
     * Delete a document (owner only)
     */
    delete: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only the owner can delete documents");
        }

        try {
          // Delete associated chunks
          await deleteDocumentChunks(input.documentId);

          // Delete document
          await deleteDocument(input.documentId);

          return { success: true };
        } catch (error) {
          console.error("Error deleting document:", error);
          throw new Error("Failed to delete document");
        }
      }),
  }),

  // ============ Chat & Conversation ============
  chat: router({
    /**
     * Get or create a conversation session
     */
    getOrCreateSession: publicProcedure
      .input(z.object({ sessionId: z.string().optional() }))
      .query(async ({ input }) => {
        const sessionId = input.sessionId || nanoid();

        let conversation = await getConversationBySessionId(sessionId);

        if (!conversation) {
          // Create new conversation
          await createConversation({
            sessionId,
            title: "MBA Class Discussion",
            messageCount: 0,
          });

          conversation = await getConversationBySessionId(sessionId);
        }

        return {
          sessionId,
          conversationId: conversation?.id,
          title: conversation?.title,
        };
      }),

    /**
     * Get conversation history
     */
    getHistory: publicProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const messages = await getConversationMessages(input.conversationId);
        return messages;
      }),

    /**
     * Send a message and get RAG-powered response
     */
    sendMessage: publicProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Save user message
          await createMessage({
            conversationId: input.conversationId,
            role: "user",
            content: input.message,
          });

          // Get all documents and their chunks
          const documents = await getDocuments();
          const allChunks: Array<{
            id: number;
            content: string;
            embedding?: number[];
            documentId: number;
            documentName: string;
          }> = [];

          for (const doc of documents) {
            const chunks = await getDocumentChunks(doc.id);
            for (const chunk of chunks) {
              allChunks.push({
                id: chunk.id,
                content: chunk.content,
                embedding: chunk.embedding as any,
                documentId: doc.id,
                documentName: doc.fileName,
              });
            }
          }

          // If no documents available, return a helpful message
          if (allChunks.length === 0) {
            const noDocsMessage =
              "I don't have any MBA class notes loaded yet. Please ask the owner to upload some documents first!";

            await createMessage({
              conversationId: input.conversationId,
              role: "assistant",
              content: noDocsMessage,
              sources: [] as any,
              citations: [] as any,
            });

            return {
              success: true,
              answer: noDocsMessage,
              sources: [],
              messageId: 0,
            };
          }

          // Retrieve relevant chunks using RAG
          const relevantChunksData = await retrieveRelevantChunks(
            input.message,
            allChunks,
            5
          );

          // Map back to full chunk data with document info
          const relevantChunks = relevantChunksData.map((chunk) => {
            const fullChunk = allChunks.find((c) => c.id === chunk.id);
            return {
              content: chunk.content,
              documentId: fullChunk?.documentId,
              documentName: fullChunk?.documentName,
            };
          });

          // Generate answer using LLM
          const { answer, sources } = await generateRAGAnswer(
            input.message,
            relevantChunks.map((c) => ({ content: c.content }))
          );

          // Extract source document info
          const sourceDocuments = relevantChunks
            .slice(0, 3)
            .map((chunk) => ({
              documentId: chunk.documentId,
              documentName: chunk.documentName,
              excerpt: chunk.content.substring(0, 200),
            }));

          // Save assistant message with sources
          const messageResult = await createMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: answer,
            sources: sourceDocuments as any,
            citations: sources as any,
          });

          // Update conversation message count
          const conversation = await getConversationBySessionId(
            `conv-${input.conversationId}`
          );
          if (conversation) {
            await updateConversation(input.conversationId, {
              messageCount: (conversation.messageCount || 0) + 2,
            });
          }

          return {
            success: true,
            answer,
            sources: sourceDocuments,
            messageId: messageResult.id,
          };
        } catch (error) {
          console.error("Error processing chat message:", error);
          throw new Error("Failed to process message");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
