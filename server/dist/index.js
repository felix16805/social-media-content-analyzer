"use strict";
/**
 * index.ts
 * Express API server entry point.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const pino_1 = __importDefault(require("pino"));
const client_1 = require("@prisma/client");
const analyze_js_1 = require("./routes/analyze.js");
const history_js_1 = require("./routes/history.js");
const health_js_1 = require("./routes/health.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const auth_js_1 = require("./middleware/auth.js");
const logger = (0, pino_1.default)({
    transport: {
        target: "pino-pretty",
        options: { colorize: true },
    },
});
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 4000;
// Parse allowed origins — comma-separated list in env var
const rawOrigins = process.env.ALLOWED_ORIGINS || "http://localhost:3000";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());
// ── Security Middleware ──────────────────────────────────────────────────────
// Helmet sets ~12 security headers (XSS, CSP, HSTS, no-sniff, etc.)
app.use((0, helmet_1.default)());
// CORS — restricted to known origins only
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json({ limit: "1mb" }));
// ── Rate Limiting ────────────────────────────────────────────────────────────
// General limiter for history reads — 60 requests per minute per IP
const readLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later.", code: "RATE_LIMITED" },
});
// Strict limiter for analysis (expensive operation) — 30 per minute per IP
const analyzeLimiter = (0, express_rate_limit_1.rateLimit)({
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
app.use("/api/health", (0, health_js_1.createHealthRouter)());
// All other routes require bearer token auth
app.use("/api/analyze", auth_js_1.requireAuth, analyzeLimiter, (0, analyze_js_1.createAnalyzeRouter)(prisma));
app.use("/api/history", auth_js_1.requireAuth, readLimiter, (0, history_js_1.createHistoryRouter)(prisma));
// ── Error Handling ───────────────────────────────────────────────────────────
// Catch 404s
app.use((req, _res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});
// Global error handler
app.use(errorHandler_js_1.errorHandler);
// ── Startup ──────────────────────────────────────────────────────────────────
async function startServer() {
    try {
        await prisma.$connect();
        logger.info("Connected to database");
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Allowed origins: ${allowedOrigins.join(", ")}`);
            logger.info(`Auth: ${process.env.API_SECRET ? "enabled" : "disabled (API_SECRET not set)"}`);
        });
    }
    catch (err) {
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
//# sourceMappingURL=index.js.map