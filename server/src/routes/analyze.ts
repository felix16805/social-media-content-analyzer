/**
 * analyze.ts
 * POST /api/analyze — accepts extracted text, runs analysis, persists to Postgres.
 */

import { Router } from "express";
import { z } from "zod";
import { PrismaClient, Prisma } from "@prisma/client";
import { analyzeText } from "../lib/analyzeText.js";
import { validate } from "../middleware/validate.js";

const analyzeSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

/**
 * Creates the analyze router with a shared Prisma instance.
 */
export function createAnalyzeRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.post("/", validate(analyzeSchema), async (req, res, next) => {
    try {
      const { text } = req.body as z.infer<typeof analyzeSchema>;
      const analysis = analyzeText(text);

      const record = await prisma.analysis.create({
        data: {
          extractedText: text,
          wordCount: analysis.wordCount,
          sentenceCount: analysis.sentenceCount,
          hashtagCount: analysis.hashtagCount,
          emojiCount: analysis.emojiCount,
          hasCallToAction: analysis.hasCta,
          readabilityScore: analysis.avgWordsPerSentence,
          overallScore: analysis.overallScore,
          suggestions: analysis.suggestions as unknown as Prisma.InputJsonValue,
          platforms: analysis.platforms as unknown as Prisma.InputJsonValue,
        },
      });

      res.json({
        analysisId: record.id,
        analysis,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
