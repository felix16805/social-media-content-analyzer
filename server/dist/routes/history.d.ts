/**
 * history.ts
 * GET /api/history — paginated list of past analyses.
 * GET /api/history/:id — full detail of one analysis.
 * DELETE /api/history/:id — deletes one analysis.
 */
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
/**
 * Creates the history router with a shared Prisma instance.
 */
export declare function createHistoryRouter(prisma: PrismaClient): Router;
//# sourceMappingURL=history.d.ts.map