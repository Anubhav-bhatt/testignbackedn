# Legal-IQ AI Setup Guide

## Prerequisites

### 1. Install Ollama (Local LLM Runtime)

```bash
brew install ollama
```

### 2. Pull the Required Models

```bash
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

### 3. Start the Ollama Server

```bash
ollama serve
```

This runs on `http://localhost:11434` by default.

---

## Run the Backend (Hosts the AI)

### 4. Install Dependencies

```bash
cd Backend
npm install
```

### 5. Set Up Environment Variables

Make sure your `.env` file in `Backend/` has the following:

```env
DATABASE_URL=<your postgres connection string>
OLLAMA_BASE_URL=http://localhost:11434      # optional, this is the default
OLLAMA_CHAT_MODEL=llama3.1:8b              # optional, this is the default
OLLAMA_EMBED_MODEL=nomic-embed-text        # optional, this is the default
```

### 6. Ingest AI Data (Seed Legal Knowledge into Vector DB)

```bash
npm run ingest:ai-data
```

### 7. Reindex Existing Documents (If You Have Uploaded Docs Already)

```bash
npm run reindex:documents
```

### 8. Start the Backend Server

```bash
npm run dev
```

---

## Verify

The AI endpoints are exposed through the backend's `/api/ai` routes. Test with:

```bash
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Section 138 of NI Act?"}'
```

---

## Key Points

- **Ollama must be running** before starting the backend.
- The AI uses **RAG** (Retrieval-Augmented Generation) — it searches indexed documents/case data and feeds relevant chunks to the LLM.
- **Chat model:** `llama3.1:8b` | **Embedding model:** `nomic-embed-text` (configurable via env vars).
