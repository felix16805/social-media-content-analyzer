"use strict";
/**
 * errorHandler.ts
 * Centralized Express error-handling middleware.
 * Returns a consistent { error, code } JSON shape.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
/**
 * Catches all errors thrown or passed via next() and returns a uniform JSON response.
 */
function errorHandler(err, _req, res, _next) {
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        res.status(400).json({ error: message, code: "VALIDATION_ERROR" });
        return;
    }
    // Standard Error objects
    if (err instanceof Error) {
        const status = err.status ?? 500;
        res.status(status).json({
            error: err.message || "Internal server error",
            code: status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR",
        });
        return;
    }
    // Fallback
    res.status(500).json({ error: "Unknown error", code: "INTERNAL_ERROR" });
}
//# sourceMappingURL=errorHandler.js.map