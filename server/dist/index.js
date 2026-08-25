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
const pino_1 = __importDefault(require("pino"));
const client_1 = require("@prisma/client");
const analyze_js_1 = require("./routes/analyze.js");
const history_js_1 = require("./routes/history.js");
const health_js_1 = require("./routes/health.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const logger = (0, pino_1.default)({
    transport: {
        target: "pino-pretty",
        options: { colorize: true },
    },
});
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
// ── Middleware ───────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
}));
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});
// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/health", (0, health_js_1.createHealthRouter)());
app.use("/api/analyze", (0, analyze_js_1.createAnalyzeRouter)(prisma));
app.use("/api/history", (0, history_js_1.createHistoryRouter)(prisma));
// ── Error Handling ───────────────────────────────────────────────────────────
// Catch 404s
app.use((req, res, next) => {
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