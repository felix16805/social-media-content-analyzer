"use strict";
/**
 * analyze.ts
 * POST /api/analyze — accepts extracted text, runs analysis, persists to Postgres.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnalyzeRouter = createAnalyzeRouter;
const express_1 = require("express");
const zod_1 = require("zod");
const analyzeText_js_1 = require("../lib/analyzeText.js");
const validate_js_1 = require("../middleware/validate.js");
const router = (0, express_1.Router)();
const analyzeSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, "Text is required"),
});
/**
 * Creates the analyze router with a shared Prisma instance.
 */
function createAnalyzeRouter(prisma) {
    router.post("/", (0, validate_js_1.validate)(analyzeSchema), async (req, res, next) => {
        try {
            const { text } = req.body;
            const analysis = (0, analyzeText_js_1.analyzeText)(text);
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
                    suggestions: analysis.suggestions,
                    platforms: analysis.platforms,
                },
            });
            res.json({
                analysisId: record.id,
                analysis,
            });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
//# sourceMappingURL=analyze.js.map