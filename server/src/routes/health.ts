/**
 * health.ts
 * GET /api/health — Simple health check endpoint for monitoring/Docker.
 */

import { Router } from "express";

export function createHealthRouter(): Router {
  const router = Router();

  router.get("/", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
