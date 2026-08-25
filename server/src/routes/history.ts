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
export function createHistoryRouter(prisma: PrismaClient): Router {
  const router = Router();

  // ── Paginated list ──────────────────────────────────────────────────────────
  router.get("/", async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.analysis.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            createdAt: true,
            wordCount: true,
            overallScore: true,
            suggestions: true,
          },
        }),
        prisma.analysis.count(),
      ]);

      // Build a brief summary of suggestions (count by status)
      const itemsWithSummary = items.map((item: any) => {
        const suggestions = item.suggestions as Array<{ status: string }>;
        const summary = { good: 0, warning: 0, error: 0 };
        for (const s of suggestions) {
          if (s.status === "good") summary.good++;
          else if (s.status === "warning") summary.warning++;
          else if (s.status === "error") summary.error++;
        }
        return {
          id: item.id,
          createdAt: item.createdAt,
          wordCount: item.wordCount,
          overallScore: item.overallScore,
          suggestionsSummary: summary,
        };
      });

      res.json({
        items: itemsWithSummary,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  });

  // ── Single analysis detail ──────────────────────────────────────────────────
  router.get("/:id", async (req, res, next) => {
    try {
      const analysis = await prisma.analysis.findUnique({
        where: { id: req.params.id },
      });

      if (!analysis) {
        const err = new Error("Analysis not found") as Error & { status: number };
        err.status = 404;
        throw err;
      }

      res.json(analysis);
    } catch (err) {
      next(err);
    }
  });

  // ── Delete ──────────────────────────────────────────────────────────────────
  router.delete("/:id", async (req, res, next) => {
    try {
      // Check existence first
      const existing = await prisma.analysis.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      });

      if (!existing) {
        const err = new Error("Analysis not found") as Error & { status: number };
        err.status = 404;
        throw err;
      }

      await prisma.analysis.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
