# Atlas - AI Procurement Platform

> **Qwen Cloud Hackathon - Track 4: Autopilot Agent**

An AI-powered procurement management platform that automates intake workflows, supplier sourcing, risk evaluation, and contract negotiation using Qwen Cloud's full AI stack.

*Atlas bears the weight of procurement so your team doesn't have to.*

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  AgentChat │ Dashboard │ KnowledgeBase │ Suppliers │ Workflows  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / NDJSON Streaming
┌──────────────────────────▼──────────────────────────────────────┐
│                    Express Backend (server.ts)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Agent Chat  │  │ RAG Pipeline │  │ Document Classification│  │
│  │ (Streaming) │  │ (Embeddings) │  │ (Structured Output)    │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬─────────────┘  │
│         │                │                      │                │
│  ┌──────▼────────────────▼──────────────────────▼─────────────┐  │
│  │              Qwen Cloud APIs (DashScope)                   │  │
│  │  qwen3.7-plus │ text-embedding-v4 │ qwen3-rerank │ VL/OCR │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Firebase Firestore (Data Layer)               │  │
│  │  intakes │ suppliers │ knowledgeBase │ kbChunks │ spend    │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Qwen Cloud Integration

### Text Generation
- **Model**: `qwen3.7-plus` for all agent reasoning, document classification, and analysis
- **Thinking Mode**: `enable_thinking: true` with `thinking_budget: 2048` for efficient reasoning
- **Web Search**: `enable_search: true` with `search_strategy: "agent"` for real-time supplier research
- **Streaming**: NDJSON streaming for real-time token-by-token response delivery

### RAG (Retrieval-Augmented Generation)
- **Embeddings**: `text-embedding-v4` (1024 dimensions) for semantic document search
- **Reranking**: `qwen3-rerank` for precision reranking of search results
- **Pipeline**: Chunk → Embed → Store → Query → Search → Rerank → Inject relevant context

### Multimodal
- **Vision**: `qwen3.5-omni-flash` for audio transcription (voice-to-text)
- **Image Search**: Responses API with `web_search_image` tool for product visualization
- **Web Extractor**: Responses API with `web_extractor` for deep supplier research

### Context Optimization
- **Session Cache**: `x-dashscope-session-cache: enable` for reduced multi-turn latency
- **Explicit Cache**: `cache_control: {type: 'ephemeral'}` on system prompt for prefix reuse
- **Preserved Thinking**: `preserve_thinking: true` for cross-turn reasoning context

### Structured Output
- **JSON Schema**: `response_format: { type: "json_schema" }` for reliable document classification
- **Function Calling**: 13 tools with structured parameter schemas

### Human-in-the-Loop
- **Approval Gates**: `request_approval` tool pauses workflow for critical decisions
- **Confirmation**: `confirm_action` tool proceeds only after explicit user approval

## Features

1. **Autonomous Procurement Agent** - Conversational AI (Atlas) that handles intake, sourcing, and negotiation
2. **Knowledge Base with RAG** - Semantic search across procurement documents using text-embedding-v4 + qwen3-rerank
3. **Supplier Risk Evaluation** - AI-powered risk assessment with web research
4. **Bid Matrix Generation** - Comparative analysis of multiple suppliers
5. **Voice Input** - Audio transcription for hands-free interaction
6. **Document Classification** - Auto-categorize uploaded procurement documents with structured output
7. **Workflow Designer** - Visual procurement workflow builder
8. **Dashboard Analytics** - Real-time spend tracking and metrics
9. **Human-in-the-Loop** - Approval gates for critical procurement decisions

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your Qwen Cloud API key in `.env.local`:
   ```
   QWEN_API_KEY=sk-your-dashscope-api-key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express, TypeScript
- **AI**: Qwen Cloud (DashScope API)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication

## License

Apache-2.0
