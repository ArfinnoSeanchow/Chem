# Chemly API — Technical Specification v1

## 1. Purpose

Chemly API is a thin, stateless HTTP layer over the existing deterministic chemistry engine.

The API is intentionally separated from the React UI. The current web application and the future Android application can call the same endpoints, so calculation logic remains a single source of truth.

### Design goals

- exact redox balancing
- deterministic output
- no duplicated chemistry engine in Android
- small HTTP surface
- low latency
- bounded input
- cache successful deterministic calculations
- explicit verification
- safe error responses
- no new external runtime service
- compatible with Vercel serverless functions

The API layer does **not** replace or modify `src/utils/redoxSolver.ts`, `src/utils/chemistryParser.ts`, or `src/utils/formulaAutoCorrector.ts`.

---

## 2. Architecture

```text
                    ┌──────────────────┐
                    │  Chemly Web      │
                    │  React / Vite    │
                    └────────┬─────────┘
                             │
                    HTTPS JSON API
                             │
                    ┌────────▼─────────┐
                    │   Chemly API     │
                    │ Vercel Functions │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
      Redox Solver      Auto Corrector    Verification
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                    Existing exact engine
                             │
                             ▼
                       JSON response

                    Android (later)
                             │
                             └──── same API
```

---

## 3. Files added

```text
api/
├── _lib/
│   ├── http.ts
│   ├── cache.ts
│   └── rateLimit.ts
├── health.ts
├── redox/
│   ├── solve.ts
│   └── verify.ts
└── corrector/
    └── normalize.ts

API_TECHNICAL.md
```

Only the API layer is added. Existing chemistry/UI files are intentionally not replaced.

---

## 4. Endpoints

### GET `/api/health`

Purpose: deployment/availability check.

Example:

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "service": "chemly-api",
  "status": "ok",
  "version": "1",
  "engine": "exact-redox",
  "timestamp": "2026-09-21T00:00:00.000Z"
}
```

---

### GET `/api/redox/solve`

Query:

```text
equation
medium
```

Example:

```text
/api/redox/solve?equation=MnO4-%20%2B%20Fe2%2B%20-%3E%20Mn2%2B%20%2B%20Fe3%2B&medium=acidic
```

The endpoint also accepts `POST`.

POST body:

```json
{
  "equation": "MnO4- + Fe2+ -> Mn2+ + Fe3+",
  "medium": "acidic"
}
```

Supported media:

```text
acidic
basic
neutral
```

Response contains:

- balanced equation
- balanced species
- oxidation/reduction changes
- oxidizing agent
- reducing agent
- transferred electrons
- atom verification
- charge verification
- electron verification
- half-reaction steps
- oxidation-number/PBO steps
- detailed half reactions
- interactive terms

Example core result:

```json
{
  "success": true,
  "data": {
    "equation": "MnO₄− + 5 Fe2+ + 8 H+ → Mn2+ + 5 Fe3+ + 4 H₂O",
    "verification": {
      "allAtomsBalanced": true,
      "chargeBalanced": true,
      "electronsBalanced": true
    }
  }
}
```

---

## 5. Verification endpoint

### GET/POST `/api/redox/verify`

This endpoint intentionally returns only verification-focused information.

POST:

```json
{
  "equation": "Cr2O7^2- + Fe2+ -> Cr3+ + Fe3+",
  "medium": "acidic"
}
```

It checks:

1. every relevant atom
2. total ionic charge
3. electron accounting

The endpoint returns `success: true` only when all three verification layers pass.

Expected reaction:

```text
Cr₂O₇²⁻ + 6 Fe²⁺ + 14 H⁺
→ 2 Cr³⁺ + 6 Fe³⁺ + 7 H₂O
```

---

## 6. Corrector endpoint

### GET/POST `/api/corrector/normalize`

Purpose: normalize user input before solving.

POST:

```json
{
  "equation": "Cr2O72−+Fe2+⟶Cr3+Fe3+"
}
```

The endpoint uses the existing Chemly auto-corrector.

It can return:

- original input
- corrected equation
- whether correction was required
- diagnostics
- detailed explanation
- correction badges

Recommended client flow:

```text
User input
   ↓
/api/corrector/normalize
   ↓
corrected equation
   ↓
/api/redox/solve
   ↓
verified result
```

---

## 7. Input limits

The HTTP layer rejects oversized or malformed requests before invoking the chemistry engine.

Current limits:

```text
Maximum equation length: 1000 characters
Maximum JSON body:       32 KB
Rate limit:              60 requests/minute/IP
```

These limits are deliberately conservative because normal chemistry equations are tiny compared with them.

---

## 8. Performance strategy

### A. Deterministic cache

Successful redox results are cached in-process using:

```text
equation + medium
```

The cache:

- stores up to 250 entries
- default TTL: 60 seconds
- removes expired entries
- removes oldest entries when full

This is an optimization only. The solver remains the source of truth.

### B. No database required

For pure solving, a database would add latency and operational complexity without providing useful state.

The API is intentionally stateless.

### C. No AI in the calculation path

The redox endpoint does not call Gemini or another external AI service.

This is important:

```text
reaction
   ↓
deterministic solver
   ↓
verification
   ↓
result
```

AI explanation can remain a separate feature.

---

## 9. Rate limiting

The API contains a lightweight in-memory limiter:

```text
60 requests / minute / IP
```

This protects casual abuse without requiring Redis or another external service.

Important production note:

Vercel functions are horizontally distributed. Therefore this limiter is **best-effort per warm function instance**, not a globally synchronized quota.

If Chemly later needs strict global quotas, add a shared store such as Redis/Upstash at that stage. It is intentionally not required for v1.

---

## 10. CORS

Default behavior allows browser clients.

For a locked production deployment, configure:

```text
CHEMLY_API_ORIGIN=https://your-domain.example
```

Then only that origin is returned in `Access-Control-Allow-Origin`.

For the Android client, CORS does not normally matter because native HTTP clients are not browser-origin constrained.

---

## 11. Error model

Errors are returned consistently:

```json
{
  "success": false,
  "requestId": "....",
  "error": {
    "code": "INVALID_EQUATION",
    "message": "Use an equation arrow such as ->."
  }
}
```

Known error codes include:

```text
EQUATION_REQUIRED
EQUATION_TOO_LONG
INVALID_EQUATION
INVALID_MEDIUM
BODY_TOO_LARGE
METHOD_NOT_ALLOWED
RATE_LIMITED
SOLVER_REJECTED
INTERNAL_ERROR
```

`requestId` is included so production errors can be traced without exposing internal stack traces.

---

## 12. Android integration contract

Do not put chemistry logic into the Android APK during v1.

Android should call:

```text
POST /api/redox/solve
```

Example Kotlin request payload:

```json
{
  "equation": "MnO4- + Fe2+ -> Mn2+ + Fe3+",
  "medium": "acidic"
}
```

Then render:

```text
data.equation
data.verification
data.redox
data.steps
```

This gives Web and Android a shared calculation source.

---

## 13. Recommended Android request flow

```text
User
 ↓
Android input
 ↓
POST /api/corrector/normalize
 ↓
normalized equation
 ↓
POST /api/redox/solve
 ↓
verification
 ↓
UI
```

If the user input is already normalized, the client may skip the corrector endpoint.

---

## 14. Deployment

The API folder is designed for Vercel's file-based serverless functions.

After placing the files in the project:

```bash
npm install
npm run build
```

Then deploy normally:

```bash
vercel
```

or push to the connected GitHub repository and let Vercel deploy it.

Expected routes:

```text
/api/health
/api/redox/solve
/api/redox/verify
/api/corrector/normalize
```

---

## 15. Local testing

Run the normal Chemly development server for the web UI.

For API-only testing, the project can also be served through an Express adapter if desired, but the production API files are designed around Vercel functions.

Example request:

```bash
curl "http://localhost:3000/api/redox/solve?equation=MnO4-%20%2B%20Fe2%2B%20-%3E%20Mn2%2B%20%2B%20Fe3%2B&medium=acidic"
```

---

## 16. Security rules

Never expose:

```text
GEMINI_API_KEY
private API keys
server environment variables
internal stack traces
```

The redox API itself does not require a secret key.

For a future authenticated API, add authentication separately rather than embedding secrets in the APK.

---

## 17. API versioning

Current:

```text
/api/...
```

When the contract becomes stable enough for external clients, migrate to:

```text
/api/v1/redox/solve
/api/v1/redox/verify
/api/v1/corrector/normalize
```

Do not break the existing Android client when adding v2.

---

## 18. What is intentionally NOT included

This package does not include:

- a second redox engine
- a second parser
- a database
- Redis
- AI calculation
- Android project
- UI rewrite
- CDN
- external chemistry API

The existing Chemly engine remains the single source of truth.

---

## 19. Production checklist

Before exposing the API publicly:

- [ ] `npm run build`
- [ ] test acidic reactions
- [ ] test basic reactions
- [ ] test neutral reactions
- [ ] test half reactions
- [ ] test disproportionation
- [ ] test compact ionic input
- [ ] test Unicode charges
- [ ] test malformed equations
- [ ] test oversized requests
- [ ] test rate limiting
- [ ] configure `CHEMLY_API_ORIGIN`
- [ ] verify no secrets are committed
- [ ] test from Android
- [ ] monitor Vercel function errors

---

## 20. Golden test cases

### Permanganate / iron

```text
MnO4- + Fe2+ -> Mn2+ + Fe3+
medium: acidic
```

Expected:

```text
MnO4− + 5 Fe2+ + 8 H+
→ Mn2+ + 5 Fe3+ + 4 H2O
```

### Dichromate / iron

```text
Cr2O7^2- + Fe2+ -> Cr3+ + Fe3+
medium: acidic
```

Expected:

```text
Cr2O7²− + 6 Fe2+ + 14 H+
→ 2 Cr3+ + 6 Fe3+ + 7 H2O
```

### Permanganate / oxalate

```text
MnO4- + C2O4^2- -> Mn2+ + CO2
medium: acidic
```

Expected:

```text
2 MnO4− + 5 C2O4²− + 16 H+
→ 2 Mn2+ + 10 CO2 + 8 H2O
```

All three should have:

```text
atomsBalanced = true
chargeBalanced = true
electronsBalanced = true
```

---

## 21. Design principle

The API should stay boring.

The chemistry engine is where complexity belongs.

```text
HTTP layer       → validate / protect / route
Chemistry parser → normalize / parse
Redox engine     → calculate
Verification     → prove result
API              → serialize
Client           → display
```

This keeps the system fast, testable, and portable to Android.
