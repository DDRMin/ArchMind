## Archmind · Software Engineering Workbench

Archmind turns high-level requirements into a structured software architecture brief by calling Google's Gemini API. It outputs a solution overview, component breakdown, decision rationale (plus refinement ideas), and a PlantUML-style diagram description, all inside a single glassmorphic screen.

### Tech stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS 3 + shadcn/ui
- Gemini `gemini-pro` via `@google/generative-ai`

### Prerequisites
1. Node.js 18+
2. Gemini API key with access to `gemini-pro`

### Setup
1. Install dependencies:

```powershell
npm install
```

2. Configure environment variables:

```powershell
Copy-Item .env.example .env.local
# then edit .env.local to set GEMINI_API_KEY
```

3. Start the local dev server:

```powershell
npm run dev
```

Visit `http://localhost:3000` to use the workbench. The textarea accepts any free-form requirement brief; hit **Generate Architecture** to call the `/api/generate` route, which forwards the request to Gemini.

### Testing & linting

```powershell
npm run lint
```

### Key files
- `app/page.tsx` – renders the single-page workbench
- `components/architecture-workbench.tsx` – client component containing UI logic, loading/error states, and layout
- `app/api/generate/route.ts` – server route that prompts Gemini and normalizes the JSON response

### Environment reference
- `GEMINI_API_KEY`: required to authenticate with Gemini. Never commit real keys; use `.env.local` for local dev and host-specific secrets in production.

### Production
Run `npm run build` followed by `npm start` per usual Next.js deployment guidance. Configure the Gemini key wherever your hosting provider stores secrets.
