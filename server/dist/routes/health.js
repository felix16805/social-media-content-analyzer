"use strict";
/**
 * health.ts
 * GET /api/health — Simple health check endpoint for monitoring/Docker.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthRouter = createHealthRouter;
const express_1 = require("express");
function createHealthRouter() {
    const router = (0, express_1.Router)();
    router.get("/", (req, res) => {
        res.json({
            status: "ok",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    });
    return router;
}
//# sourceMappingURL=health.js.map