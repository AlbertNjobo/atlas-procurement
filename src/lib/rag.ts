import OpenAI from "openai";

const DASHSCOPE_BASE = "https://dashscope-intl.aliyuncs.com";

// Create a dedicated OpenAI client for embeddings (no session cache needed)
let embeddingClient: OpenAI | null = null;

export function getEmbeddingClient(): OpenAI {
  if (!embeddingClient) {
    embeddingClient = new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL: `${DASHSCOPE_BASE}/compatible-mode/v1`,
    });
  }
  return embeddingClient;
}

// Chunk text into overlapping segments for embedding
export function chunkText(text: string, chunkSize: number = 500, overlap: number = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 20) {
      chunks.push(chunk);
    }
  }
  return chunks;
}

// Generate embeddings for text chunks using text-embedding-v4
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getEmbeddingClient();
  // DashScope embedding API supports batch of up to 10
  const allEmbeddings: number[][] = [];
  const batchSize = 10;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await client.embeddings.create({
      model: "text-embedding-v4",
      input: batch,
      dimensions: 1024,
    });
    for (const item of response.data) {
      allEmbeddings.push(item.embedding);
    }
  }
  return allEmbeddings;
}

// Generate a single embedding for a query
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const client = getEmbeddingClient();
  const response = await client.embeddings.create({
    model: "text-embedding-v4",
    input: text,
    dimensions: 1024,
  });
  return response.data[0].embedding;
}

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Search for relevant chunks using cosine similarity
export function searchChunks(
  queryEmbedding: number[],
  chunks: Array<{ text: string; embedding: number[]; docId: string; title: string }>,
  topK: number = 5,
  minScore: number = 0.3
): Array<{ text: string; docId: string; title: string; score: number }> {
  const scored = chunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((chunk) => chunk.score >= minScore).slice(0, topK);
}

// Smart chunking: smaller chunks for short policy docs, larger for long reference docs
export function chunkTextSmart(text: string, isPolicy: boolean = false): string[] {
  if (isPolicy) {
    // Policies need fine-grained chunks so individual rules aren't diluted
    return chunkText(text, 200, 50);
  }
  // Reference docs use larger chunks for better context
  return chunkText(text, 500, 100);
}

// Rerank results using qwen3-rerank
export async function rerankResults(
  query: string,
  results: Array<{ text: string; docId: string; title: string; score: number }>,
  topN: number = 5
): Promise<Array<{ text: string; docId: string; title: string; score: number; rank: number }>> {
  if (results.length === 0) return [];

  try {
    const response = await fetch(`${DASHSCOPE_BASE}/compatible-api/v1/reranks`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.QWEN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3-rerank",
        query: query,
        documents: results.map((r) => r.text),
        top_n: Math.min(topN, results.length),
        return_documents: false,
      }),
    });

    if (!response.ok) {
      console.error("Reranking failed, returning original order");
      return results.slice(0, topN).map((r, i) => ({ ...r, rank: i + 1 }));
    }

    const data = await response.json();
    const reranked = (data.results || []).map((item: any) => ({
      ...results[item.original_index],
      score: item.relevance_score,
      rank: item.index + 1,
    }));

    return reranked;
  } catch (e) {
    console.error("Reranking error:", e);
    return results.slice(0, topN).map((r, i) => ({ ...r, rank: i + 1 }));
  }
}
