# Install API layer into the existing Chemly project

Copy only:

```text
api/
API_TECHNICAL.md
API_INSTALL.md
```

into the project root.

Do NOT replace the existing `src/` files.

The API imports the existing engine directly:

```text
api/redox/solve.ts
      ↓
src/utils/redoxSolver.ts
```

and the existing corrector:

```text
api/corrector/normalize.ts
      ↓
src/utils/formulaAutoCorrector.ts
```

No duplicate calculation engine is introduced.

## Local routes

After deploying through Vercel:

```text
GET  /api/health
GET  /api/redox/solve
POST /api/redox/solve
GET  /api/redox/verify
POST /api/redox/verify
GET  /api/corrector/normalize
POST /api/corrector/normalize
```

## Recommended first test

```powershell
curl.exe "http://localhost:5173/api/health"
```

If the API is deployed separately, replace the host with the deployment URL.

For solving, POST is recommended:

```powershell
curl.exe -X POST "https://YOUR-DOMAIN/api/redox/solve" `
  -H "Content-Type: application/json" `
  -d '{\"equation\":\"MnO4- + Fe2+ -> Mn2+ + Fe3+\",\"medium\":\"acidic\"}'
```

The Vercel deployment must expose the `api/` directory as serverless functions. The existing Vite UI remains unchanged.
