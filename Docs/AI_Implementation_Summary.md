# Legal-IQ AI — Implementation Summary

**Date:** 19 March 2026  
**Project:** Legal-IQ  
**Scope:** AI Insights, RAG Pipeline, Knowledge Base Ingestion, Note Embedding

---

## 1. Architecture Overview

Legal-IQ's AI system runs on the **Backend** using:

- **Ollama** (local LLM runtime) — no cloud API keys needed
- **Chat Model:** llama3:latest (8B parameters)
- **Embedding Model:** nomic-embed-text (137M parameters)
- **Vector Store:** PostgreSQL with pgvector extension
- **RAG** (Retrieval-Augmented Generation) for grounding responses in real case data

### Data Flow

```
User uploads document → chunks text (1400 chars, 250 overlap)
                     → embeds each chunk via Ollama nomic-embed-text
                     → stores in case_embeddings table (PostgreSQL + pgvector)

User asks AI question → embeds the question
                     → cosine similarity search against stored embeddings
                     → top matching chunks fed as context to llama3
                     → LLM generates grounded response
```

---

## 2. What Was Already Working

### Document Upload Embedding
**File:** `Backend/src/controllers/documentController.ts`

When a user uploads a PDF/text file with a `caseId`:
- File is saved to `Backend/uploads/`
- Text extracted (PDF or plain text)
- Chunked into ~1400 character segments with 250 char overlap
- Each chunk embedded via Ollama and stored in `case_embeddings` table
- Linked to the case for scoped retrieval

### Intake Document Linking
**File:** `Backend/src/controllers/caseController.ts`

Documents uploaded during signup (before case creation) get automatically indexed when linked to a new case.

### AI Insights Endpoint
**File:** `Backend/src/services/insightsService.ts`

`GET /api/ai/insights/:caseId` generates a structured analysis:
- Case summary
- Tactical insights
- Evidentiary risks
- Precedents analysis
- Procedural next steps
- Probability assessment

### AI Chat Endpoint
**File:** `Backend/src/services/aiService.ts`

`POST /api/ai/query` accepts a question and optional caseId:
- Retrieves relevant chunks (case-scoped first, then global fallback)
- Feeds context + case notes + hearing history to Ollama
- Returns structured JSON with answer, next action, risk/caution
- Includes source citations with similarity scores

### RAG Retrieval
**File:** `Backend/src/services/ragService.ts`

Two-tier retrieval:
1. **Case-scoped search** — searches embeddings for the specific case
2. **Global fallback** — if no good match, searches ALL embeddings across all cases

Minimum relevance score: 0.18 (cosine similarity threshold)

### Frontend AI Screens
**File:** `Frontend/app/ai.tsx`

- **Analysis tab:** Shows case intelligence summary, evidence risks, strategic action plan, relevant citations
- **Chat tab:** Interactive chat with RAG-powered responses and source citations with similarity scores
- **AIAssistantCard component** (`Frontend/components/AIAssistantCard.tsx`): Embedded in case details page showing inline AI insights

---

## 3. Changes Made in This Session

### 3.1 API Timeout Fix
**File:** `Frontend/api.ts`

**Problem:** Default axios timeout was 12 seconds. Ollama needs 30-120 seconds to generate responses, causing "AI Insight Error" on the frontend.

**Fix:** Increased timeout to 120 seconds for all AI-related API calls:
- `getCaseAnalysis()` — 120s timeout
- `getAIInsights()` — 120s timeout
- `queryAI()` — 120s timeout

### 3.2 Case Note Embedding (New Feature)
**Files:** `Backend/src/services/ragService.ts`, `Backend/src/controllers/noteController.ts`

**Problem:** Case notes were NOT being embedded into the vector DB. Notes written on past cases (strategies, outcomes, observations) were invisible to RAG retrieval. New similar cases couldn't learn from past case notes.

**Fix — ragService.ts:** Added two new functions:
- `indexNoteEmbedding(noteId, caseId, content)` — chunks and embeds note text into `case_embeddings` with `document_id = note_{noteId}`
- `deleteNoteEmbeddings(noteId)` — removes note embeddings when a note is deleted

**Fix — noteController.ts:**
- `createNote`: After saving the note, asynchronously embeds it into the vector DB
- `deleteNote`: Removes note embeddings before deleting the note record

**Impact:** All new notes are now searchable via RAG. When a new case asks the AI a question, relevant notes from ANY past case can surface through the global fallback search.

### 3.3 Indian Legal Knowledge Base Documents
**Directory:** `AI/data/`

Added comprehensive reference documents that get embedded into the global knowledge base when `npm run ingest:ai-data` is run:

#### bhartiya-nyaya-sanhita-2023.md (BNS)
- Complete IPC → BNS section mapping table (30+ key sections)
- New offences: organised crime, terrorism, hit-and-run, mob lynching
- Bail and anticipatory bail provisions
- Limitation periods for filing complaints
- Punishment categories including new community service provision
- Practice notes for lawyers on transition from IPC to BNS

#### bhartiya-nagarik-suraksha-sanhita-2023.md (BNSS)
- Complete CrPC → BNSS section mapping table (25+ key sections)
- Bail provisions: bailable, non-bailable, anticipatory bail
- Timeline mandates: charge sheet, judgment, adjournments, committal
- Electronic evidence and forensic investigation requirements
- Zero FIR and e-FIR provisions
- Practice notes for lawyers

#### bhartiya-sakshya-adhiniyam-2023.md (BSA)
- Evidence Act → BSA section mapping table
- Electronic evidence admissibility (Section 63 BSA)
- Certificate requirements for digital evidence
- Types of admissible electronic evidence (emails, WhatsApp, CCTV, UPI, CDRs)
- Key Supreme Court precedents on electronic evidence
- Expert evidence provisions
- Burden of proof rules

#### indian-legal-provisions-reference.md
- Negotiable Instruments Act Section 138 (cheque dishonour) with key cases
- Arbitration Act: Sections 9, 11, 34, 36
- Consumer Protection Act 2019 jurisdiction limits
- Limitation Act key periods table
- RERA provisions
- Motor Vehicles Act compensation provisions

---

## 4. How Cross-Case Intelligence Now Works

```
Past Case A: Note written — "Bail granted under Section 482 BNSS, surety of ₹50,000"
             → Note embedded into case_embeddings

New Case B: User asks AI — "What bail strategy should I follow for this case?"
             → Query embedded
             → Cosine similarity search finds Past Case A's note
             → Note content provided as context to Ollama
             → AI generates response citing past case strategy
```

This works because:
1. Notes are now embedded on creation
2. The global fallback searches ALL embeddings when case-scoped results are insufficient
3. BNS/BNSS/BSA knowledge base provides statutory context alongside case-specific data

---

## 5. Setup & Running Instructions

### Prerequisites
```bash
brew install ollama
ollama pull llama3:latest
ollama pull nomic-embed-text
```

### Start Services
```bash
# Terminal 1 — Ollama
ollama serve

# Terminal 2 — Backend
cd Backend
npm install
npm run ingest:ai-data    # Embed BNS, BNSS, BSA, legal provisions
npm run reindex:documents  # Re-embed existing uploaded documents
npm run dev               # Start the backend server
```

### Environment Variables (Backend/.env)
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=llama3:latest
OLLAMA_EMBED_MODEL=nomic-embed-text
```

### Verify
```bash
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Section 138 of NI Act?"}'
```

---

## 6. Files Modified/Created

| File | Action | Description |
|---|---|---|
| `Frontend/api.ts` | Modified | Increased AI call timeouts to 120s |
| `Backend/src/services/ragService.ts` | Modified | Added indexNoteEmbedding, deleteNoteEmbeddings |
| `Backend/src/controllers/noteController.ts` | Modified | Embed notes on create, remove on delete |
| `AI/data/bhartiya-nyaya-sanhita-2023.md` | Created | BNS key provisions and IPC mapping |
| `AI/data/bhartiya-nagarik-suraksha-sanhita-2023.md` | Created | BNSS key provisions and CrPC mapping |
| `AI/data/bhartiya-sakshya-adhiniyam-2023.md` | Created | BSA evidence law provisions |
| `AI/data/indian-legal-provisions-reference.md` | Created | NI Act, Arbitration, Consumer, Limitation |
| `Docs/AI_SETUP_GUIDE.md` | Created | Setup instructions document |
