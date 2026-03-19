# Project Change Document (2026-03-16)

## Scope
This document summarizes the changes made for deployment readiness, AI integration stability, and OTP debugging visibility.

## Commits Covered
1. bcb3906 - fix backend runtime imports for render deploy
2. 22cddd2 - fix render build by isolating backend compile
3. ec8cf29 - prepare backend deploy

## AI Changes
1. Reworked backend AI response generation to use backend-local Gemini integration.
File: Backend/src/services/aiService.ts
Impact: Removed runtime dependency on external AI folder for primary query response path.

2. Added backend-local case insights service.
File: Backend/src/services/insightsService.ts
Impact: Case insights endpoint can run using DB-derived metrics without importing external AI modules.

3. Updated case analysis controller import to use local insights service.
File: Backend/src/controllers/caseController.ts
Impact: Prevents deploy-time TypeScript failures caused by cross-folder AI imports.

4. Updated AI route insights import to use local insights service.
File: Backend/src/routes/ai.ts
Impact: Keeps /api/ai/insights functional while staying backend-only for compilation.

5. Disabled background ingestion coupling in upload flow (deploy-safe behavior).
File: Backend/src/controllers/documentController.ts
Impact: Document upload still works; background AI ingestion is skipped in this deploy-safe mode.

## Backend Build and Deploy Changes
1. Restricted TypeScript compilation scope to backend source only.
File: Backend/tsconfig.json
Change: include now targets src/**/* and excludes non-runtime files like test scripts and ingestion runner.
Impact: Render build no longer compiles ../AI and avoids missing module errors.

2. Kept server health route active for Render checks.
File: Backend/src/index.ts
Route: GET /
Response: Legal IQ Backend is running
Impact: Health check remains stable for deployment verification.

## Auth and OTP Debugging Changes
1. Added clear OTP logging in backend sendOtp flow.
File: Backend/src/controllers/authController.ts
Log includes phone and generated OTP.
Impact: Easier local/dev OTP verification from backend logs.

2. Added OTP logging in frontend API helper after send-otp call.
File: Frontend/api.ts
Impact: OTP is visible in frontend console during testing.

## Deployment Outcome
1. Build issue root cause was cross-folder imports from Backend runtime files into AI folder outside Backend dependency context.
2. Fix applied by localizing runtime AI dependencies and tightening TypeScript compile scope.
3. Backend TypeScript build passes locally after these changes.

## Repository Push Status
1. Main deployment repo updated:
https://github.com/Anubhav-bhatt/testignbackedn.git

2. Backend-only split repository was also pushed earlier:
https://github.com/Anubhav-bhatt/justbackedn.git

## Important Configuration Note
DB_NAME currently appears as defultdb in local env.
File: Backend/.env
Recommendation: Confirm actual DB name on Render environment (commonly defaultdb) to avoid runtime DB connection/query issues.

## Quick Verification Checklist
1. Trigger Render manual deploy with clear cache.
2. Confirm build step completes without AI module-not-found errors.
3. Confirm service health endpoint returns expected string.
4. Test POST /api/auth/send-otp.
5. Test GET /api/ai/insights/:caseId.

## Ollama RAG Rollout Started
Date: 2026-03-16

### Goal
Replace Gemini-backed runtime AI with a local Ollama-based retrieval augmented generation pipeline for legal responses and case analysis.

### Implementation Log
1. Added a backend-local Ollama client.
Files:
- Backend/src/services/ollamaService.ts
Purpose:
- Centralizes local model generation and embeddings.
- Reads OLLAMA_BASE_URL, OLLAMA_CHAT_MODEL, and OLLAMA_EMBED_MODEL from environment.

2. Added backend-local RAG utilities.
Files:
- Backend/src/services/ragService.ts
Purpose:
- Extract text from PDF, TXT, and MD files.
- Chunk documents for embedding.
- Store embeddings in case_embeddings.
- Retrieve top matching chunks for grounded generation.

3. Reworked the live AI response service to use Ollama plus retrieval.
Files:
- Backend/src/services/aiService.ts
Impact:
- /api/ai/query and case chat paths now build answers from case data, notes, hearings, and retrieved document chunks.

4. Reworked case analysis generation to use Ollama JSON output with deterministic fallback.
Files:
- Backend/src/services/insightsService.ts
Impact:
- Case analysis stays compatible with existing frontend response fields while now using local retrieval context.

5. Re-enabled document indexing at upload time.
Files:
- Backend/src/controllers/documentController.ts
Impact:
- Newly uploaded case documents are now indexed into the local RAG store in the background.

6. Added indexing for intake documents that are linked after case creation.
Files:
- Backend/src/controllers/caseController.ts
Impact:
- Documents uploaded before a case exists are indexed once the case is created and the files are attached.

7. Added a backfill script for old documents.
Files:
- Backend/src/reindexDocuments.ts
- Backend/package.json
Command:
- npm run reindex:documents
Impact:
- Existing stored documents can be embedded and added to the new RAG knowledge base.

### Required Environment Variables
Add these in Backend/.env:
- OLLAMA_BASE_URL=http://localhost:11434
- OLLAMA_CHAT_MODEL=llama3.1:8b
- OLLAMA_EMBED_MODEL=nomic-embed-text

### Required Ollama Setup
1. Install Ollama locally.
2. Pull the runtime models:
- ollama pull llama3.1:8b
- ollama pull nomic-embed-text
3. Start Ollama before running the backend.

### Verification Steps For This Rollout
1. Start Ollama locally.
2. Start the backend.
3. Upload a PDF or text document to a case.
4. Query the AI chat endpoint for that case.
5. Confirm the answer reflects uploaded document content.
6. Run case analysis and confirm the response is still compatible with the frontend.

### Verification Status
1. Backend TypeScript build passes locally after the Ollama RAG changes.
2. Static checks on the new backend files pass.
3. Live runtime verification against a running Ollama instance is still pending.

### Open Follow-Up Work
1. Add database-side vector search using pgvector if faster retrieval is required.
2. Add explicit source citation display in the frontend.
3. Add an ingestion queue if large PDF uploads start delaying response-time-sensitive work.
4. Evaluate whether fine-tuning is still needed after RAG quality is measured.

## RAG Response Grounding Upgrade
Date: 2026-03-16

### Goal
Make AI chat responses visibly grounded in retrieved chunks instead of returning opaque model text.

### Changes Made
1. Upgraded retrieval service to return retrieval scope and source metadata.
Files:
- Backend/src/services/ragService.ts
Impact:
- Retrieval now reports whether context came from the current case or from the broader indexed corpus.
- Source excerpts and similarity scores are now generated for downstream UI use.

2. Upgraded AI query responses to return text plus sources.
Files:
- Backend/src/services/aiService.ts
- Backend/src/routes/ai.ts
Impact:
- /api/ai/query now returns `response`, `sources`, and retrieval metadata.
- Structured JSON generation is attempted first, with plain-text fallback if Ollama does not return clean JSON.

3. Added a retrieval inspection endpoint.
Files:
- Backend/src/routes/ai.ts
Endpoint:
- POST /api/ai/retrieve
Impact:
- RAG debugging is now possible without invoking full answer generation.

4. Updated frontend AI chat to render cited sources.
Files:
- Frontend/api.ts
- Frontend/app/ai.tsx
Impact:
- Each AI response in chat can show the retrieved source labels, match scores, and excerpts.

### Verification Target
1. Ask a case-specific question in chat.
2. Confirm the API response includes a non-empty `sources` array when relevant chunks exist.
3. Confirm the chat UI renders source cards under the AI message.
4. Confirm `POST /api/ai/retrieve` returns the same sources independently of generation.

## OTP Flow Fix
Date: 2026-03-16

### Problem
The OTP flow was not actually secure or server-verified. The backend generated an OTP and returned it to the client, and the frontend compared the OTP locally using route params.

### Changes Made
1. Added a backend OTP verification endpoint.
Files:
- Backend/src/controllers/authController.ts
- Backend/src/routes/auth.ts
Impact:
- OTP validation now happens on the server through POST /api/auth/verify-otp.

2. Added backend in-memory OTP storage with expiry and attempt limits.
Files:
- Backend/src/controllers/authController.ts
Impact:
- OTP codes expire after 5 minutes.
- OTP codes are invalidated after successful verification.
- Repeated wrong attempts are rate-limited per requested OTP.

3. Normalized phone numbers before send, verify, and login operations.
Files:
- Backend/src/controllers/authController.ts
Impact:
- Formatting differences like spaces or country-code punctuation no longer break OTP verification.

4. Updated frontend OTP handling to use backend verification.
Files:
- Frontend/api.ts
- Frontend/app/auth/login.tsx
- Frontend/app/auth/documents.tsx
- Frontend/app/auth/otp.tsx
Impact:
- The app no longer passes the OTP through navigation params.
- OTP verification now round-trips to the backend.
- Resend OTP is now wired from the OTP screen.

### Debug Mode Behavior
Because no SMS provider is integrated yet, the backend can expose a debug OTP for development.
Rules:
- In non-production or when OTP_DEBUG=true, the response includes debugOtp and the backend logs the OTP.
- In production with OTP_DEBUG disabled, the API does not expose the OTP to the client.

### Verification Target
1. Request OTP from login or signup flow.
2. Enter wrong OTP and confirm backend returns Invalid OTP.
3. Enter correct OTP and confirm signup or login continues.
4. Use resend and confirm the previous OTP becomes obsolete.
