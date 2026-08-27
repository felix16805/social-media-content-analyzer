/**
 * health.ts
 * GET /api/health — Simple health check endpoint for monitoring/Docker.
 */

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export function createHealthRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    let dbStatus = "unknown";
    try {
      // Just check if we can run a simple query
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (err) {
      dbStatus = "disconnected";
    }

    res.json({
      status: "ok",
      dbStatus,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasApiSecret: !!process.env.API_SECRET,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
