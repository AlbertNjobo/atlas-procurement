# Alibaba Cloud Deployment Proof

**Project:** Procurely (AI Procurement Autopilot Agent)  
**Hackathon:** Global AI Hackathon Series with Qwen Cloud — Track 4: Autopilot Agent  
**Live demo:** https://procurely.dpdns.org  

This document is the repository proof that the backend runs on **Alibaba Cloud** and that all AI inference is served by **Qwen Cloud (DashScope)** on Alibaba infrastructure.

---

## 1. Qwen Cloud / DashScope API (Alibaba Cloud AI)

All model calls use the international DashScope compatible endpoint:

| Concern | Value |
|---------|--------|
| API base URL | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| Auth | `QWEN_API_KEY` (DashScope API key) |
| Client | OpenAI-compatible SDK pointed at DashScope |

### Code references

| File | What it proves |
|------|----------------|
| [`server.ts`](../server.ts) | OpenAI client `baseURL` → DashScope; Alibaba/Qwen header comment block |
| [`src/lib/rag.ts`](../src/lib/rag.ts) | `text-embedding-v4` + `qwen3-rerank` via DashScope |
| [`src/routes/agent.ts`](../src/routes/agent.ts) | Chat, tool loop, speech, Responses API |
| [`src/lib/tool-executor.ts`](../src/lib/tool-executor.ts) | Specialist tools calling Qwen models |

### Models used on Qwen Cloud

| Model | Role |
|-------|------|
| `qwen3.7-plus` | Primary agent (reasoning + tools) |
| `qwen3.6-flash` | Specialist sub-agents (risk, bid, compliance) |
| `qwen3.5-plus` | Background tasks, vision-related flows |
| `text-embedding-v4` | RAG + memory embeddings (1024d) |
| `qwen3-rerank` | RAG reranking |
| `qwen3.5-omni-flash` | Speech-to-text |
| Plus optional multi-provider models exposed in the model picker | DeepSeek / GLM / MiMo via Qwen Cloud catalog |

---

## 2. Application hosting (Alibaba Cloud compute)

The production app is containerized and run on an Alibaba Cloud instance (Simple Application Server / ECS-class VM):

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20 Docker image |
| Orchestration | Docker Compose (`docker-compose.yml`) |
| Reverse proxy | Nginx (`nginx.conf`) on ports 80/443 |
| App process | `dist/server.cjs` on port 3000 |
| CDN / DNS / TLS edge | Cloudflare → origin on Alibaba host |
| Public hostname | `procurely.dpdns.org` |

### Code / config references

| File | What it proves |
|------|----------------|
| [`Dockerfile`](../Dockerfile) | Production image build (`npm ci`, `npm run build`, healthcheck) |
| [`docker-compose.yml`](../docker-compose.yml) | `atlas` (app) + `nginx` services |
| [`nginx.conf`](../nginx.conf) | Reverse proxy to the Node app |
| Architecture diagram | [`docs/architecture.md`](./architecture.md) — “Alibaba Cloud SAS — Docker” |

### Deploy commands (on the Alibaba host)

```bash
# On the Alibaba Cloud server
git clone https://github.com/AlbertNjobo/atlas-procurement.git
cd atlas-procurement
cp .env.example .env   # set QWEN_API_KEY, RESEND_*, API_SECRET
docker compose up -d --build
curl -f http://localhost:3000/api/health
```

---

## 3. Architecture (how pieces connect)

```
Browser → Cloudflare (DNS/TLS) → Alibaba Cloud VM
                                      ├── Nginx :80/:443
                                      └── Node Procurely :3000
                                            ├── Firebase (Auth + Firestore)
                                            ├── Zvec local vector index (./data)
                                            ├── Resend (email)
                                            └── DashScope / Qwen Cloud (Alibaba AI APIs)
```

---

## 4. Judge checklist

- [x] Backend AI traffic targets `dashscope-intl.aliyuncs.com` (Alibaba Cloud)
- [x] Container deployment files present for Alibaba VM hosting
- [x] Architecture docs name Alibaba Cloud + Qwen Cloud
- [x] Live deployment URL for functional demo
- [x] Open-source MIT license at repo root

For questions about the deployment topology, see [`docs/architecture.md`](./architecture.md).
