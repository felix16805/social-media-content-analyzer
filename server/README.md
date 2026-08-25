# Express Backend

This directory contains the Express + TypeScript backend for the Social Media Content Analyzer.

## Environment Variables

Copy `.env.example` to `.env`:

- `DATABASE_URL`: Connection string for PostgreSQL
- `PORT`: Port to listen on (default 4000)
- `CORS_ORIGIN`: Allowed origin for CORS (default http://localhost:3000)

## Prisma Commands

```bash
npx prisma generate       # Generate Prisma client after schema changes
npx prisma migrate dev    # Create and apply migrations locally
npx prisma migrate deploy # Apply pending migrations (used in CI/Prod)
npx prisma studio         # Open UI to explore database contents
```

## Scripts

- `npm run dev` - Starts TSX watch for development
- `npm run build` - Compiles TypeScript to `dist/` and generates Prisma client
- `npm start` - Runs the compiled output
- `npm run lint` - Type checks without emitting
- `npm test` - Runs Jest unit/integration tests
