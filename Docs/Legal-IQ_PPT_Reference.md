# Legal-IQ — Complete Application Reference (PPT Guide)

---

## 1. What Is Legal-IQ?

A **mobile-first legal practice management platform** for Indian lawyers and law firms. It combines case management, document handling, payments, scheduling, and **AI-powered legal intelligence** (RAG + LLM) into a single app.

---

## 2. Tech Stack

| Layer           | Technology                                              |
|-----------------|---------------------------------------------------------|
| Frontend        | React Native (Expo 54), TypeScript, Expo Router         |
| Backend         | Node.js, Express v5, TypeScript                         |
| Database        | PostgreSQL + pgvector extension                         |
| AI (Cloud)      | Google Gemini 2.5-flash (chat), gemini-embedding-001    |
| AI (Local)      | Ollama — llama3:8b (chat), nomic-embed-text (embed)     |
| Vector Search   | pgvector with HNSW index, 768-dim cosine similarity     |
| Deployment      | Render (Node.js web service + PostgreSQL)               |
| Auth            | Phone OTP + Biometric (fingerprint/face)                |

---

## 3. Application Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Expo/React Native)          │
│  Dashboard │ Cases │ AI Chat │ Calendar │ Admin Panel    │
└──────────────────────┬───────────────────────────────────┘
                       │ REST API (Axios + user-id header)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                   │
│  Auth │ Cases │ Documents │ Notes │ Payments │ AI Routes │
└───────┬──────────────┬───────────────────────────────────┘
        │              │
        ▼              ▼
┌──────────────┐  ┌─────────────────────────────────────┐
│  PostgreSQL  │  │         AI / RAG Pipeline            │
│  (relational │  │  Embed → pgvector → Retrieve → LLM  │
│   + pgvector)│  │  (Gemini API or Ollama local)        │
└──────────────┘  └─────────────────────────────────────┘
```

---

## 4. All 8 Services

### 4.1 Authentication Service
- Phone-based OTP login (6-digit, 5-min TTL, max 5 attempts)
- Biometric unlock (fingerprint/face via Expo LocalAuthentication)
- Admin approval workflow for new user signups
- Endpoints:
  - `POST /api/auth/signup` — Register (name, email, phone)
  - `POST /api/auth/login` — Phone login
  - `POST /api/auth/send-otp` — Generate & send OTP
  - `POST /api/auth/verify-otp` — Validate OTP

### 4.2 Case Management Service
- Full lifecycle: create → track → close
- Status tracking: Newly Filed → Evidence → Cross-Examination → Arguments → Bail Hearing → Mediation → Closed
- Categories: Civil, Criminal
- Linked documents, payments, notes, hearings per case
- Endpoints:
  - `GET /api/cases` — List all cases (filtered by lawyer_id)
  - `POST /api/cases` — Create new case
  - `GET /api/cases/:id` — Full case details (docs + payments + notes + hearings)
  - `PATCH /api/cases/:id/hearing` — Update next hearing
  - `PATCH /api/cases/:id/deal` — Update billing terms
  - `POST /api/cases/:id/close` — Close case

### 4.3 Document Management Service
- Upload PDF/TXT/MD files via Multer
- Auto-indexing: uploaded docs are chunked, embedded, and stored in vector DB
- Text extraction: pdf-parse for PDFs, raw read for text files
- Endpoints:
  - `POST /api/documents/upload` — Upload file (auto-index if case linked)
  - `GET /api/documents` — Fetch documents (filter by caseId)
  - `DELETE /api/documents/:id` — Delete document + embeddings

### 4.4 Notes Service
- Case-specific notes with auto-embedding for RAG retrieval
- Notes from one case surface in other cases via global vector search
- Endpoints:
  - `GET /api/notes` — Fetch notes (filter by caseId)
  - `POST /api/notes` — Create note + auto-embed
  - `DELETE /api/notes/:id` — Delete note + remove embeddings

### 4.5 Payments Service
- Per-case financial tracking (amount, status, description)
- Dashboard calculates: pending = total_fixed_amount - paid
- Endpoints:
  - `GET /api/payments` — Fetch payments (filter by caseId)
  - `POST /api/payments` — Create payment record
  - `DELETE /api/payments/:id` — Delete payment

### 4.6 Reminders Service
- Hearing & task reminders
- Endpoints:
  - `GET /api/reminders` — Fetch all reminders
  - `POST /api/reminders` — Create reminder
  - `DELETE /api/reminders/:id` — Delete reminder

### 4.7 User/Profile Service
- Profile management (name, specialization, avatar, bar ID)
- Admin controls: approve/reject users, manage accounts
- Endpoints:
  - `GET /api/user/profile` — Get profile
  - `PUT /api/user/profile` — Update profile
  - `GET /api/user/all` — Admin: list all users
  - `POST /api/user/create` — Admin: create user
  - `PATCH /api/user/:id/status` — Admin: approve/reject
  - `DELETE /api/user/:id` — Admin: delete user

### 4.8 AI Intelligence Service
- RAG-powered legal assistant (chat + structured analysis)
- Two modes: case-specific and global knowledge base
- Endpoints:
  - `POST /api/ai/query` — Chat with AI (query + optional caseId)
  - `GET /api/ai/insights/:caseId` — Structured case analysis
  - `POST /api/ai/retrieve` — Retrieve relevant context chunks

---

## 5. AI / RAG Pipeline (Key Differentiator)

### 5.1 Document Ingestion Pipeline
```
User Uploads PDF/TXT
        ↓
Extract Text (pdf-parse / raw read)
        ↓
Normalize (remove extra whitespace)
        ↓
Chunk (1400 chars per chunk, 250-char overlap)
        ↓
Embed Each Chunk (Gemini or Ollama → 768-dim vector)
        ↓
Store in case_embeddings table (pgvector)
        ↓
Build HNSW Index for fast similarity search
```

### 5.2 AI Chat / Query Flow
```
User Asks Question (+ optional caseId)
        ↓
Embed the Query → 768-dim vector
        ↓
Two-Tier Vector Search:
  1. Case-scoped: search embeddings WHERE case_id = X
  2. Global fallback: search ALL embeddings if case results insufficient
        ↓
Cosine Similarity Ranking (threshold ≥ 0.18)
        ↓
Retrieve Top 6 Chunks
        ↓
Build Context Block:
  - Case details (title, category, court, status)
  - Recent notes & hearing history
  - Retrieved document chunks
        ↓
Send to LLM (Gemini 2.5-flash or Ollama llama3:8b)
        ↓
Return: { answer, next_action, risk_or_caution, sources[] }
```

### 5.3 Case Insights (Structured Analysis)
```
GET /api/ai/insights/:caseId
        ↓
Fetch: case details + documents + notes + hearings + payments
        ↓
Calculate Metrics:
  - Document count, note count, hearing count
  - Paid amount, pending amount
        ↓
Risk Assessment:
  - HIGH: no docs + upcoming hearings
  - MEDIUM: no docs OR pending payments
  - LOW: everything in order
        ↓
Vector search for related precedents (top 5)
        ↓
LLM generates structured JSON:
  {
    case_summary,
    tactical_insights[],
    evidentiary_risks[],
    precedents_analysis,
    procedural_next_steps[],
    probability_assessment
  }
```

### 5.4 Pre-Embedded Legal Knowledge Base
Indian laws available for all RAG queries:
- **BNS 2023** — Bhartiya Nyaya Sanhita (new criminal law)
- **BNSS 2023** — Bhartiya Nagarik Suraksha Sanhita (new criminal procedure)
- **BSA 2023** — Bhartiya Sakshya Adhiniyam (evidence law)
- **Reference Guide** — NI Act, Arbitration Act, Consumer Protection, Limitation Act, RERA, Motor Vehicles Act

### 5.5 AI Prompt Design
- **System Prompt**: Positions AI as "Legal-IQ AI, a Juris Doctor level legal researcher"
- Mandates precise legal terminology (prima facie, estoppel, res judicata)
- Provides case-specific context, never generic disclaimers
- Insights prompt demands exact JSON keys for structured output

---

## 6. Database Schema (7 Tables)

### users
| Column         | Type    | Description               |
|----------------|---------|---------------------------|
| id             | TEXT PK | Unique user ID            |
| name           | TEXT    | Full name                 |
| email          | TEXT    | Unique email              |
| phone          | TEXT    | Phone number              |
| firm_name      | TEXT    | Law firm                  |
| bar_id         | TEXT    | Bar Council ID            |
| specialization | TEXT    | Legal specialization      |
| avatar         | TEXT    | Profile image             |
| role           | TEXT    | lawyer / admin / client   |
| status         | TEXT    | pending / approved        |
| summary        | JSONB   | Stats cache               |

### cases
| Column             | Type    | Description                    |
|--------------------|---------|--------------------------------|
| id                 | TEXT PK | Internal ID                    |
| case_id            | TEXT    | Display ID (e.g., CIV-2024-001)|
| title              | TEXT    | Case title                     |
| client_name        | TEXT    | Client name                    |
| category           | TEXT    | Civil / Criminal               |
| court              | TEXT    | Court name                     |
| next_hearing       | TEXT    | Next hearing date              |
| status             | TEXT    | Case stage                     |
| lawyer_id          | TEXT FK | Assigned lawyer                |
| total_fixed_amount | NUMERIC | Total billing amount           |

### documents
| Column        | Type      | Description                    |
|---------------|-----------|--------------------------------|
| id            | TEXT PK   | Document ID                    |
| filename      | TEXT      | Stored filename                |
| original_name | TEXT      | User-facing name               |
| mime_type     | TEXT      | File type                      |
| size          | BIGINT    | File size in bytes             |
| case_id       | TEXT FK   | Linked case                    |
| doc_type      | TEXT      | selfie / fir / aadhar / pan    |
| created_at    | TIMESTAMP | Upload timestamp               |

### payments
| Column      | Type      | Description          |
|-------------|-----------|----------------------|
| id          | TEXT PK   | Payment ID           |
| amount      | NUMERIC   | Payment amount       |
| status      | TEXT      | Paid / Pending       |
| description | TEXT      | Payment description  |
| case_id     | TEXT FK   | Linked case          |
| date        | TIMESTAMP | Payment date         |

### notes
| Column     | Type      | Description        |
|------------|-----------|--------------------|
| id         | TEXT PK   | Note ID            |
| content    | TEXT      | Note text          |
| case_id    | TEXT FK   | Linked case        |
| created_at | TIMESTAMP | Creation timestamp |

### hearings
| Column       | Type   | Description              |
|--------------|--------|--------------------------|
| id           | TEXT PK| Hearing ID               |
| case_id      | TEXT FK| Linked case              |
| date         | TEXT   | Hearing date             |
| purpose      | TEXT   | Hearing purpose          |
| status       | TEXT   | Past / Upcoming          |
| document_ids | TEXT[] | Array of document IDs    |

### case_embeddings (Vector Store)
| Column      | Type              | Description                      |
|-------------|-------------------|----------------------------------|
| id          | SERIAL PK         | Auto-increment ID                |
| case_id     | TEXT FK           | Linked case                      |
| document_id | TEXT              | Doc ID or "note_{noteId}"        |
| content     | TEXT              | Original text chunk              |
| metadata    | JSONB             | Source, chunk index, doc type    |
| embedding   | vector(768)       | pgvector embedding               |
| created_at  | TIMESTAMPTZ       | Creation timestamp               |

**Index**: HNSW on `embedding` column using `vector_cosine_ops`

---

## 7. Frontend Screens

| Screen              | Key Features                                                        |
|---------------------|---------------------------------------------------------------------|
| **Login**           | Phone number input, biometric option                                |
| **OTP Verification**| 6-digit code entry, 5-min validity                                  |
| **Signup**          | Name, email, phone registration                                    |
| **Doc Upload**      | Mandatory: FIR, Aadhar, PAN, Selfie (intake)                       |
| **Pending Approval**| Waiting screen until admin approves                                 |
| **Dashboard**       | Stats cards, case list, search, swipe-to-close, profile sidebar     |
| **Cases List**      | All cases with filters and search                                   |
| **New Case**        | Intake form + document upload                                       |
| **Case Details**    | Tabs: Overview, Documents, Payments, Notes, Hearings + AI card      |
| **AI Analysis**     | Analysis tab (structured report) + Chat tab (interactive + sources) |
| **Global AI**       | General legal queries across knowledge base                         |
| **Calendar**        | Month view of all hearings                                          |
| **Clients**         | Client directory                                                    |
| **Priority Cases**  | High-priority case view                                             |
| **Profile**         | Edit avatar, name, specialization, settings                         |
| **Admin Panel**     | Approve/reject/delete users                                         |

### Theme Support
- Dark mode / Light mode toggle
- Persistent in AsyncStorage
- Primary color: #1D4ED8 (blue)

---

## 8. Authentication Flow

```
App Launch
    ↓
Check AsyncStorage for userToken
    ↓
No token? → /auth/login → Enter phone → Send OTP → Verify OTP
    ↓                                                    ↓
New user? → Signup → Upload Docs → Admin Approval → Dashboard
    ↓
Existing user + biometric enabled? → Fingerprint/Face check → Dashboard
    ↓
Token exists + approved? → Dashboard
```

---

## 9. Key Data Flows

### Creating a Case
```
Lawyer fills form → POST /api/cases → Save to DB
    → Link documents → Async: indexDocument() per doc
    → Each doc: extract text → chunk → embed → store vectors
```

### AI Chat
```
Lawyer asks question → POST /api/ai/query {query, caseId}
    → Embed query → Vector search (case-scoped → global fallback)
    → Retrieve top 6 chunks → Build context + prompt
    → LLM generates answer → Return with sources
```

### Document Upload
```
Upload file → POST /api/documents/upload → Save to uploads/
    → If caseId: async indexDocument()
    → Extract text → Chunk (1400 chars) → Embed (768-dim) → Store in pgvector
```

### Adding a Note
```
Create note → POST /api/notes → Save to DB
    → Async: indexNoteEmbedding() → Chunk → Embed → Store vectors
    → Available for cross-case RAG retrieval
```

---

## 10. Deployment

### Render Configuration
- **Service**: Node.js web service (free tier)
- **Build**: `cd Backend && npm install && npm run build`
- **Start**: `cd Backend && npm start`
- **Database**: Render PostgreSQL with pgvector

### Environment Variables
| Variable            | Purpose                        |
|---------------------|--------------------------------|
| DB_HOST/USER/PASS   | PostgreSQL connection          |
| DB_SSL              | true for production            |
| GEMINI_API_KEY      | Google Gemini API access       |
| OLLAMA_BASE_URL     | Local Ollama server URL        |
| OLLAMA_CHAT_MODEL   | llama3:8b                      |
| OLLAMA_EMBED_MODEL  | nomic-embed-text               |
| PORT                | Server port (3000 dev, 10000 prod) |
| OTP_DEBUG           | Log OTPs to console            |

---

## 11. Unique Selling Points (for PPT Highlights)

1. **AI-Powered Legal Intelligence** — Not just storage; the app analyzes cases, identifies risks, suggests precedents, and provides probability assessments
2. **RAG Pipeline** — Documents and notes are vectorized for intelligent retrieval, making the AI contextually aware of all case materials
3. **Indian Law Knowledge Base** — Pre-embedded BNS 2023, BNSS 2023, BSA 2023 for accurate Indian legal context
4. **Dual AI Backend** — Supports both cloud (Gemini) and local (Ollama) LLMs for flexibility and privacy
5. **Cross-Case Intelligence** — Notes from one case surface as insights in related cases via global vector search
6. **Mobile-First Design** — Built for lawyers on the go with biometric security and dark/light themes
7. **Complete Practice Management** — Cases + Docs + Payments + Hearings + Notes + AI in one platform
8. **Admin Workflow** — User approval system ensures only verified lawyers access the platform
