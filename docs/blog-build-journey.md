# Building Procurely: An AI Agent That Actually Handles Procurement

**How I built an autonomous procure-to-pay system using 11 Qwen Cloud models, and what I learned along the way.**

---

## The Problem That Started Everything

During my internship at the Institute of Chartered Accountants, I watched procurement happen in slow motion. Requests sat in email inboxes for days. Approvals required walking paper forms between offices. Tracking spend meant opening three different spreadsheets and hoping the numbers matched.

Everyone knew the process was broken. But they'd been doing it this way for years, and nobody had time to fix it.

When the Global AI Hackathon with Qwen Cloud launched, I saw my chance to build what I wished existed during that internship , an AI agent that could handle the entire procure-to-pay lifecycle autonomously.

## What Procurely Actually Does

Procurely isn't another chatbot. It's a procurement agent that takes a natural language request and runs it through the complete business workflow:

**User says:** "I need 10 laptops for the engineering team under $15K"

**Procurely does:**
1. Qualifies the request against company KB policies
2. Searches the procurement catalog for matching items
3. Checks budget availability for the department
4. Creates a purchase requisition with full audit trail
5. Routes through approval workflows based on amount thresholds
6. Generates a purchase order when approved
7. Emails the vendor via Resend

The visual workflow designer lets procurement teams build custom approval chains without writing code , from simple auto-approvals to multi-level CFO sign-offs.

## The Tech Stack (And Why I Chose Each Piece)

### Qwen Cloud , 11 Models, Different Jobs

This was the core insight: no single model does everything well. I use 11 models, each optimized for its task:

| Model | Job | Why |
|-------|-----|-----|
| `qwen3.7-plus` | Primary chat agent | Best reasoning + tool calling |
| `qwen3.6-flash` | Specialist sub-agents | Fast, cheap for risk/bid/compliance analysis |
| `qwen3.5-plus` | OCR, memory extraction | Good balance of speed and accuracy |
| `text-embedding-v4` | Document vectorization | 1024d embeddings for RAG |
| `qwen3-rerank` | Search result ranking | Cross-attention for precision |
| `qwen3.5-omni-flash` | Voice input | Real-time transcription |
| `glm-5.2` / `deepseek` / `mimo` | Alternative models | User choice in the UI |

The multi-model approach let me optimize cost and performance for each stage of the procurement pipeline.

### The 30+ Agent Tools

Each tool handles one specific procurement action:

- **Catalog search** , find items in the company database
- **Supplier lookup** , check vendor details and risk levels
- **RFQ creation** , generate quotation requests
- **Bid analysis** , compare vendor proposals
- **PO generation** , create purchase orders
- **Invoice OCR** , extract data from scanned invoices
- **Budget checks** , verify department spending limits
- **Email notifications** , send POs and approvals via Resend

The agent decides which tools to call based on the conversation context.

### Visual Workflow Designer

Built with ReactFlow, the workflow designer lets procurement teams create custom approval chains visually:

- **Trigger nodes** , what starts the workflow (requisition submitted, invoice received)
- **Condition nodes** , branch on amount, department, category, risk level
- **Approval nodes** , human review gates with multi-level chains
- **Action nodes** , generate POs, notify vendors, check budgets

No code required. Procurement managers can design their own approval workflows.

## Challenges I Faced

### 1. Multi-Model Orchestration

Coordinating 11 models across different tasks was the hardest part. Each model has different token limits, response formats, and capabilities. I had to build a routing layer that picks the right model for each task without wasting tokens.

**Solution:** A model registry that maps task types to optimal models, with fallback chains.

### 2. Real-Time Streaming

Building streaming SSE responses while handling tool calls mid-stream required careful state management. The agent might call 3-4 tools in sequence, each requiring a round-trip to the server.

**Solution:** A buffered streaming pipeline that accumulates tool call results before sending the next chunk to the client.

### 3. Email Deliverability

Getting Resend working with DNS verification across Cloudflare was educational. DKIM, SPF, DMARC , each record had to be exactly right.

**Solution:** Step-by-step DNS configuration with the Resend CLI for verification.

### 4. Workflow Execution

Building a visual workflow engine that actually executes procurement logic (not just animates nodes) was more complex than expected. Conditions need to evaluate against real data, approvals need to pause and resume.

**Solution:** A graph-walking engine that follows edges, evaluates conditions, and handles human review pauses.

## What I Learned

1. **Multi-model architecture is the future** , No single model excels at everything. Orchestrating specialized models for specific tasks gives better results than using one model for everything.

2. **The gap between "AI demo" and "AI that handles real business processes" is massive** , But it's worth bridging. Real procurement needs audit trails, approval chains, policy enforcement, and email notifications , not just chat.

3. **Email deliverability is harder than it looks** , DKIM, SPF, DMARC configuration across DNS providers is a real engineering challenge.

4. **Visual workflows need to execute, not just animate** , A pretty diagram that doesn't do anything is worthless. The workflow engine needs to actually walk the graph and execute actions.

5. **Firebase + Qwen Cloud is a powerful combo** , Real-time data sync with AI reasoning creates responsive, intelligent applications.

## Try It

**Live:** [procurely.dpdns.org](https://procurely.dpdns.org)

**Source:** [github.com/albertnjobo/procurely](https://github.com/albertnjobo/procurely)

**Built with:** React 19, Qwen Cloud (11 models), Firebase, Resend, ReactFlow, Express.js

---

*Built for the Global AI Hackathon Series with Qwen Cloud , Autopilot Agent track.*
