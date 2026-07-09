# Procurely — AI Procurement Agent

> An autonomous AI agent that handles the full procure-to-pay lifecycle using Qwen Cloud, from intake orchestration to vendor negotiation and payment processing.

**Track:** Autopilot Agent — Qwen Cloud Global AI Hackathon

## What It Does

Procurely is a procurement AI agent that automates real-world business workflows end-to-end. A user describes what they need in natural language, and the agent handles qualification, sourcing, policy enforcement, RFQ creation, bid analysis, and purchase order generation — with human approval at critical decision points.

### Key Features

- **Natural Language Procurement** — "I need 10 laptops for the engineering team under $15K" triggers an autonomous qualification and sourcing flow
- **Visual Workflow Designer** — Drag-and-drop workflow builder with custom procurement nodes, event triggers, and execution logs
- **Email Integration** — Send PO notifications, approval requests, RFQ quotes, and invoice alerts via Resend
- **KB Policy Enforcement** — Knowledge base policies are injected into the system prompt as mandatory rules; the agent refuses non-compliant requests and cites the specific policy
- **Multi-Agent Delegation** — Complex tasks are delegated to specialist sub-agents (risk analyst, bid optimizer, compliance checker) running on `qwen3.6-flash`
- **RAG-Powered Knowledge Base** — Documents are chunked, embedded with `text-embedding-v4`, stored in Zvec (HNSW index), and reranked with `qwen3-rerank`
- **Persistent Memory** — Agent remembers user preferences and past decisions across sessions using vector embeddings
- **Human-in-the-Loop** — Confirmation cards for supplier creation, RFQ submission, bid selection, and purchase orders
- **Vendor Negotiation** — AI-driven market research and counter-offer generation via web search
- **Voice Input** — Speech-to-text transcription using `qwen3.5-omni-flash`
- **Multiple AI Models** — 11 models available including Qwen, DeepSeek, GLM, MiniMax, and MiMo
- **30+ Agent Tools** — From catalog search to invoice OCR, the agent has a full procurement toolkit

## Architecture

![Procurely Architecture](docs/architecture.png)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                │
│  Dashboard │ Agent Chat │ Suppliers │ RFQs │ KB │ Workflows │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│              Cloudflare (DNS + SSL Proxy)                │
│              procurely.dpdns.org                         │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP :80
┌──────────────────────────▼──────────────────────────────┐
│                 Nginx Reverse Proxy                      │
│                 Port 80/443 → 3000                       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Express Server (server.ts :3000)            │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Agent Chat   │  │ RAG Pipeline │  │ Tool Execution │  │
│  │ (streaming)  │  │ (Zvec +      │  │ (30+ tools)    │  │
│  │              │  │  rerank)     │  │                │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                 │                   │           │
│  ┌──────▼───────┐  ┌─────▼─────┐             │           │
│  │ Transcribe   │  │   Zvec    │             │           │
│  │ (speech→text)│  │ HNSW Index│             │           │
│  └──────────────┘  └───────────┘             │           │
└─────────┼─────────────────┼───────────────────┼──────────┘
          │                 │                   │
    ┌─────▼─────┐    ┌─────▼─────┐      ┌──────▼──────┐
    │Qwen Cloud  │    │Firebase   │      │  Resend     │
    │11 Models   │    │Auth +     │      │  Email API  │
    │14+ API     │    │Firestore  │      │             │
    │calls       │    │           │      │             │
    └───────────┘    └───────────┘      └─────────────┘
```

## Qwen Cloud Integration

Procurely uses **11 AI models** across **14+ API calls**:

| Model | Purpose | API Calls |
|-------|---------|-----------|
| `qwen3.7-max` | Maximum performance tasks | Complex reasoning |
| `qwen3.7-plus` | Chat, tool calling, web search, vision, negotiation | Chat completions, web search, vision OCR |
| `qwen3.6-flash` | Specialist sub-agent tasks (risk, bid, compliance) | Delegated analysis calls |
| `qwen3.5-plus` | Balanced performance for background tasks | Title generation, memory extraction |
| `qwen3.6-plus` | Preview model for testing | Experimental features |
| `text-embedding-v4` | Document and query vectorization (1024d) | Embeddings API |
| `qwen3-rerank` | Cross-attention reranking for RAG precision | Reranking API |
| `qwen3.5-omni-flash` | Speech-to-text transcription | Audio input processing |
| `glm-5.2` | Zhipu AI model | Alternative LLM |
| `deepseek-v4-pro` | DeepSeek Pro model | Alternative LLM |
| `mimo-v2.5-pro` | Xiaomi MiMo model | Alternative LLM |

## Email Integration

Procurely uses **Resend** for transactional email delivery:

| Email Type | Template | Trigger |
|------------|----------|---------|
| PO Notification | Send purchase order to vendor | Workflow `notifyVendor` node |
| Approval Request | Request manager approval | Workflow `humanReview` node |
| Invoice Received | Notify accounts payable | Invoice workflow |
| RFQ Request | Request quotation from vendor | RFQ workflow |
| Workflow Complete | Workflow completion notice | Workflow finish |

**Domain:** `procurely.dpdns.org` (verified for sending and receiving)

## Visual Workflow Designer

Build custom procurement workflows with a drag-and-drop editor:

### Node Types
| Node | Purpose |
|------|---------|
| **Trigger** | Entry point with event type (On Submit, Scheduled, Manual) |
| **Condition** | Branch on amount, department, category, risk, vendor, priority |
| **Approval** | Human review gate with multi-level approval chains |
| **Generate PO** | Create purchase orders with template selection |
| **Notify Vendor** | Send email notifications to suppliers |
| **Output** | Collect workflow results |

### Features
- **Event Triggers** — Workflows fire automatically on requisition creation, approval, or invoice receipt
- **Multi-level Approvals** — Sequential approval chains (Manager → Director → VP)
- **Rich Conditions** — 6 condition types: amount threshold, department, category, risk, vendor, priority
- **Execution Logs** — Full audit trail of every workflow run
- **Active/Inactive Toggle** — Enable or disable workflows without deleting
- **Template Management** — Create, edit, duplicate, import/export templates

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your QWEN_API_KEY and RESEND_API_KEY

# Start development server
npm run dev
```

The app runs at `http://localhost:3000`. Sign in with Firebase Auth. On first login, demo data is auto-seeded.

### Environment Variables

```env
QWEN_API_KEY=sk-your-qwen-api-key
RESEND_API_KEY=re_your-resend-api-key
RESEND_FROM_EMAIL=Procurely <notifications@procurely.dpdns.org>
APP_URL=http://localhost:3000
```

## Demo Flow

1. **Dashboard** — View spend analytics, recent approvals, procurement pipeline
2. **Agent Chat** — "I want to order a laptop for $20,000" → agent refuses, cites KB policy
3. **Qualification** — "Find me a laptop under $2000" → interactive chips → product cards with source badges
4. **Intake Creation** — Agent creates requisition → confirmation card → persists to Firestore
5. **Supplier Directory** — View suppliers with risk badges, compliance status, email addresses
6. **Online Supplier Search** — Agent searches the web for new suppliers not in the database
7. **RFQs & Bids** — RFQ with multiple supplier bids, comparative analysis
8. **Knowledge Base** — Upload policies, toggle KB context for agent
9. **Vendor Negotiation** — AI-driven market research and counter-offers
10. **Workflow Designer** — Build custom procurement workflows visually
11. **Email Notifications** — Send POs, approvals, RFQs via Resend

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui, ReactFlow |
| Backend | Express.js, TypeScript |
| AI | Qwen Cloud (11 models, 14+ API calls) |
| Vector DB | Zvec (in-process, HNSW index) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Email | Resend (transactional email API) |
| Hosting | Alibaba Cloud SAS (Docker Compose) |
| CDN/SSL | Cloudflare (Flexible SSL) |
| Domain | procurely.dpdns.org |

## Project Structure

```
src/
├── pages/              # React page components
│   ├── AgentChat.tsx       # Main agent chat interface
│   ├── Dashboard.tsx       # Procurement dashboard
│   ├── Requisitions.tsx    # Purchase requisitions
│   ├── Suppliers.tsx       # Supplier directory
│   ├── RFQs.tsx            # Requests for quotation
│   ├── WorkflowDesigner.tsx # Visual workflow builder
│   └── ...
├── components/         # Reusable UI components
│   ├── TemplateManager.tsx # Workflow template management
│   ├── TriggerManager.tsx  # Event trigger configuration
│   └── agent/          # Agent-specific cards
├── emails/             # React Email templates
│   ├── PONotification.tsx
│   ├── ApprovalRequest.tsx
│   ├── InvoiceNotification.tsx
│   ├── RFQRequest.tsx
│   └── WorkflowComplete.tsx
├── lib/                # Core logic
│   ├── agent-tools.ts      # 30+ tool definitions
│   ├── workflow-engine.ts  # Workflow execution engine
│   ├── workflow-triggers.ts # Event trigger system
│   ├── workflow-templates.ts # Template management
│   ├── email-sender.ts     # Resend email integration
│   ├── rag.ts              # RAG pipeline
│   ├── zvec-store.ts       # Vector search
│   ├── auth-context.tsx    # Firebase auth
│   └── data-context.tsx    # Firestore data
server.ts              # Express server with all API endpoints
```

## License

MIT
