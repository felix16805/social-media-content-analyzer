"use strict";
/**
 * auth.ts
 * Bearer token authentication middleware.
 * Guards all API routes against unauthenticated access.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
/**
 * Validates the `Authorization: Bearer <token>` header against the
 * API_SECRET environment variable. Returns 401 if missing or incorrect.
 *
 * NOTE: This is a shared-secret guard appropriate for a first-party SPA.
 * For multi-tenant production use, replace with OAuth 2.0 / JWT.
 */
function requireAuth(req, res, next) {
    const secret = process.env.API_SECRET;
    // If no secret is configured (e.g. local dev without .env), skip auth
    if (!secret) {
        next();
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or malformed Authorization header", code: "UNAUTHORIZED" });
        return;
    }
    const token = authHeader.slice(7);
    if (token !== secret) {
        res.status(401).json({ error: "Invalid API token", code: "UNAUTHORIZED" });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map