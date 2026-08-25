/**
 * index.ts
 * Express API server entry point.
 */

import express from "express";
import cors from "cors";
import pino from "pino";
import { PrismaClient } from "@prisma/client";
import { createAnalyzeRouter } from "./routes/analyze.js";
import { createHistoryRouter } from "./routes/history.js";
import { createHealthRouter } from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/health", createHealthRouter());
app.use("/api/analyze", createAnalyzeRouter(prisma));
app.use("/api/history", createHistoryRouter(prisma));

// ── Error Handling ───────────────────────────────────────────────────────────

// Catch 404s
app.use((req, res, next) => {
  const err = new Error("Not Found") as Error & { status: number };
  err.status = 404;
  next(err);
});

// Global error handler
app.use(errorHandler);

// ── Startup ──────────────────────────────────────────────────────────────────

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Connected to database");

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
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
