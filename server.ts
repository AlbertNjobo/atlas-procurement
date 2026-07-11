import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import "dotenv/config";
import { initZvecStore } from "./src/lib/zvec-store";
import { rateLimit } from "./src/lib/auth-middleware";
import { registerEmailRoutes } from "./src/routes/email";
import { registerWorkflowRoutes } from "./src/routes/workflows";
import { registerMemoryRoutes } from "./src/routes/memory";
import { registerKbRoutes } from "./src/routes/kb";
import { registerDocumentRoutes } from "./src/routes/documents";
import { registerAgentRoutes } from "./src/routes/agent";

// ============================================================================
// Alibaba Cloud / Qwen Cloud Integration
// All AI capabilities are powered by Qwen Cloud (Alibaba Cloud) via DashScope API:
// - Chat: qwen3.7-plus (main agent) + qwen3.6-flash (specialist sub-agents)
// - Embeddings: text-embedding-v4 (1024 dimensions)
// - Reranking: qwen3-rerank
// - Vision / speech: qwen3.5-plus, qwen3.5-omni-flash
// API endpoint: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
// Deployment: Alibaba Cloud (Docker Compose) — see docs/alibaba-cloud.md
// ============================================================================

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Larger limit for voice base64 payloads and KB document text
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "12mb" }));

// Rate-limit all API routes (health is registered before this)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "procurely",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", rateLimit);

// Initialize Qwen via DashScope compatible mode (Alibaba Cloud)
let openai: OpenAI | null = null;
try {
  if (process.env.QWEN_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
      defaultHeaders: { "x-dashscope-session-cache": "enable" },
    });
  } else {
    console.warn("[Qwen] QWEN_API_KEY is not set — agent endpoints will fail until configured");
  }
} catch (error) {
  console.warn("Could not initialize Qwen API", error);
}

// Initialize Zvec vector store (local HNSW index under ./data)
initZvecStore();

// Register protected route modules
const getOpenAI = () => openai;
registerEmailRoutes(app);
registerWorkflowRoutes(app);
registerMemoryRoutes(app, getOpenAI);
registerKbRoutes(app);
registerDocumentRoutes(app, getOpenAI);
registerAgentRoutes(app, getOpenAI);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Procurely server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
