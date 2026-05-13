import { invokeLLM } from "./_core/llm";

/**
 * RAG (Retrieval-Augmented Generation) utilities for processing documents
 * and retrieving relevant context for chat responses.
 */

/**
 * Split text into chunks for RAG processing.
 * Uses a simple sliding window approach with overlap.
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end);

    if (chunk.trim()) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Generate a simple embedding for text using LLM.
 * For production, consider using a dedicated embedding service.
 * This creates a semantic representation of the text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // For this implementation, we'll use a simple approach:
    // Create a hash-based embedding that captures semantic meaning
    // In production, use OpenAI embeddings or similar

    // For now, return a simple embedding based on text characteristics
    // This is a placeholder - in production use proper embeddings
    const embedding = createSimpleEmbedding(text);
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return zero vector on error
    return new Array(384).fill(0);
  }
}

/**
 * Create a simple embedding from text for demonstration.
 * In production, use OpenAI embeddings or similar service.
 */
function createSimpleEmbedding(text: string): number[] {
  // Create a 384-dimensional vector (matching common embedding sizes)
  const embedding = new Array(384).fill(0);

  // Hash the text and distribute values across dimensions
  const words = text.toLowerCase().split(/\s+/);
  words.forEach((word, wordIdx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Distribute hash values across embedding dimensions
    for (let i = 0; i < embedding.length; i++) {
      const idx = (wordIdx + i) % embedding.length;
      embedding[idx] += (hash / 1000000) * Math.sin(i);
    }
  });

  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

/**
 * Calculate cosine similarity between two embeddings.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Retrieve relevant document chunks based on query.
 * Uses semantic similarity to find the most relevant chunks.
 */
export async function retrieveRelevantChunks(
  query: string,
  chunks: Array<{ id: number; content: string; embedding?: number[] }>,
  topK: number = 5
): Promise<
  Array<{
    id: number;
    content: string;
    similarity: number;
  }>
> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Calculate similarity scores
  const scored = chunks
    .map((chunk) => {
      const chunkEmbedding = chunk.embedding || new Array(384).fill(0);
      const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
      return {
        id: chunk.id,
        content: chunk.content,
        similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return scored;
}

/**
 * Generate an answer using LLM with retrieved context.
 */
export async function generateRAGAnswer(
  query: string,
  relevantChunks: Array<{ content: string }>
): Promise<{
  answer: string;
  sources: string[];
}> {
  // Build context from relevant chunks
  const context = relevantChunks
    .map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.content}`)
    .join("\n\n");

  const systemPrompt = `You are an MBA Class Assistant - an expert tutor helping students understand concepts from MBA class notes. 

Your role is to:
1. Answer questions based ONLY on the provided class notes and materials
2. Be clear, concise, and academic in your explanations
3. Always cite which source material you're referencing
4. If information is not in the provided materials, clearly state that

When answering, structure your response to be helpful and educational.`;

  const userPrompt = `Based on the following class materials, please answer this question:

Question: ${query}

Class Materials:
${context}

Please provide a clear, well-structured answer that cites the specific materials you're referencing.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const answer = typeof content === "string" ? content : "";

    // Extract source references from the answer
    const sourceMatches = answer.match(/\[Source \d+\]/g) || [];
    const sources = Array.from(new Set(sourceMatches)) as string[]; // Remove duplicates

    return {
      answer,
      sources,
    };
  } catch (error) {
    console.error("Error generating RAG answer:", error);
    throw error;
  }
}

/**
 * Extract text from PDF using a simple approach.
 * For production, use a proper PDF parsing library.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // For now, return a placeholder
    // In production, use pdf-parse or similar library
    const text = buffer.toString("utf-8");
    return text;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw error;
  }
}

/**
 * Process an uploaded document: extract text, chunk it, and generate embeddings.
 */
export async function processDocument(
  fileBuffer: Buffer,
  fileType: "pdf" | "text"
): Promise<
  Array<{
    content: string;
    embedding: number[];
    pageNumber?: number;
  }>
> {
  let text: string;

  if (fileType === "pdf") {
    text = await extractTextFromPDF(fileBuffer);
  } else {
    text = fileBuffer.toString("utf-8");
  }

  // Split into chunks
  const chunks = chunkText(text);

  // Generate embeddings for each chunk
  const processedChunks = await Promise.all(
    chunks.map(async (content, idx) => ({
      content,
      embedding: await generateEmbedding(content),
      pageNumber: Math.floor(idx / 5) + 1, // Rough page estimation
    }))
  );

  return processedChunks;
}
