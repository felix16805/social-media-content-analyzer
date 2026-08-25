# Social Media Content Analyzer

A full-stack application that analyzes extracted text (via client-side OCR for images or PDF parsing) and provides AI-driven engagement suggestions tailored for various social media platforms (Twitter, LinkedIn, Instagram, Facebook).

## Architecture

This project is structured as two independent but cooperative services:

```
┌────────────────────────────────┐       ┌────────────────────────────────┐
│  Next.js 14 Frontend           │       │  Express + TypeScript Backend  │
│  (React, Tailwind, pdfjs-dist) │──────▶│  (Prisma, Zod, Pino)           │
└────────────────────────────────┘       └────────────────────────────────┘
                                                         │
                                                         ▼
                                         ┌────────────────────────────────┐
                                         │  PostgreSQL Database           │
                                         └────────────────────────────────┘
```

- **Frontend (`./`)**: Handles file upload, client-side extraction (reducing server compute overhead), and renders beautiful UI components.
- **Backend (`./server`)**: Validates text, runs the core rule-based analysis engine, and persists historical results.
- **Graceful Degradation**: If the backend is unavailable, the frontend continues to perform local analysis seamlessly.

## Getting Started (Docker Compose)

The easiest way to run the full stack is via Docker Compose:

```bash
npm run docker:up
```

This will spin up:
- PostgreSQL on port 5432
- Backend API on port 4000 (`http://localhost:4000/api/health`)
- Frontend App on port 3000 (`http://localhost:3000`)

To stop the containers:
```bash
npm run docker:down
```

## Local Development (Without Docker)

If you prefer to run services individually:

1. **Start PostgreSQL**: Make sure you have a local postgres instance running.
2. **Backend**:
   ```bash
   cd server
   cp .env.example .env
   # Update DATABASE_URL in .env if needed
   npm install
   npx prisma migrate dev
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd ..
   cp .env.example .env.local
   npm install
   npm run dev
   ```

## API Endpoints

- `POST /api/analyze` - Accepts `{ text: string }` and returns engagement analysis.
- `GET /api/history` - Returns a paginated list of past analyses.
- `GET /api/history/:id` - Returns a single analysis by ID.
- `DELETE /api/history/:id` - Deletes an analysis.
- `GET /api/health` - Container health check.

## Testing

```bash
# Frontend Tests (React Testing Library + Jest)
npm test

# Backend Tests (Supertest + Jest)
cd server && npm test
```

## Known Limitations
- The `pdfjs-dist` library requires a webpack alias for `canvas` due to Turbopack limitations in development.
- Duplicate types: For simplicity, the `AnalysisResult` type is duplicated between frontend and backend to avoid a complex monorepo configuration.
