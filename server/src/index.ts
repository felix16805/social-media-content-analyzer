/**
 * index.ts
 * Express API server entry point.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pino from "pino";
import { PrismaClient } from "@prisma/client";
import { createAnalyzeRouter } from "./routes/analyze.js";
import { createHistoryRouter } from "./routes/history.js";
import { createHealthRouter } from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/auth.js";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Parse allowed origins — comma-separated list in env var
const rawOrigins = process.env.ALLOWED_ORIGINS || "http://localhost:3000";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

// ── Security Middleware ──────────────────────────────────────────────────────

// Helmet sets ~12 security headers (XSS, CSP, HSTS, no-sniff, etc.)
app.use(helmet());

// CORS — restricted to known origins only
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// ── Rate Limiting ────────────────────────────────────────────────────────────

// General limiter for history reads — 60 requests per minute per IP
const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later.", code: "RATE_LIMITED" },
});

// Strict limiter for analysis (expensive operation) — 30 per minute per IP
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many analysis requests, please slow down.", code: "RATE_LIMITED" },
});

// ── Request Logging ──────────────────────────────────────────────────────────

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check is public (used by Docker healthchecks and uptime monitors)
app.use("/api/health", createHealthRouter(prisma));

// All other routes require bearer token auth
app.use("/api/analyze", requireAuth, analyzeLimiter, createAnalyzeRouter(prisma));
app.use("/api/history", requireAuth, readLimiter, createHistoryRouter(prisma));

// ── Error Handling ───────────────────────────────────────────────────────────

// Catch 404s
app.use((req, _res, next) => {
  const err = new Error("Not Found") as Error & { status: number };
  err.status = 404;
  next(err);
});

// Global error handler
app.use(errorHandler);

// ── Startup ──────────────────────────────────────────────────────────────────

async function startServer() {
  try {
    app.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Allowed origins: ${allowedOrigins.join(", ")}`);
      logger.info(`Auth: ${process.env.API_SECRET ? "enabled" : "disabled (API_SECRET not set)"}`);
    });

    try {
      await prisma.$connect();
      logger.info("Connected to database");
    } catch (dbErr) {
      logger.error(dbErr, "Database connection failed on startup. Server is running, but database is down. Check DATABASE_URL.");
    }
  } catch (err) {
    logger.error(err, "Failed to start server");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
