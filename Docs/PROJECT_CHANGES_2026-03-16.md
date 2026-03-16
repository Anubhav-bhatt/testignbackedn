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
