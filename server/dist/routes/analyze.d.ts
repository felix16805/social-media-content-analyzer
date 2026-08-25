/**
 * analyze.ts
 * POST /api/analyze — accepts extracted text, runs analysis, persists to Postgres.
 */
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
/**
 * Creates the analyze router with a shared Prisma instance.
 */
export declare function createAnalyzeRouter(prisma: PrismaClient): Router;
//# sourceMappingURL=analyze.d.ts.map