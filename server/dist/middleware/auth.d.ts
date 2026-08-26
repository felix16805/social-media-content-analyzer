/**
 * auth.ts
 * Bearer token authentication middleware.
 * Guards all API routes against unauthenticated access.
 */
import type { Request, Response, NextFunction } from "express";
/**
 * Validates the `Authorization: Bearer <token>` header against the
 * API_SECRET environment variable. Returns 401 if missing or incorrect.
 *
 * NOTE: This is a shared-secret guard appropriate for a first-party SPA.
 * For multi-tenant production use, replace with OAuth 2.0 / JWT.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map