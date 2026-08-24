/**
 * app/api/extract/route.ts
 * POST /api/extract — accepts a multipart file, extracts text, runs analysis.
 * Thin orchestrator: delegates to lib/ modules.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/extractPdf";
import { extractImageText } from "@/lib/extractImage";
import { analyzeText, type AnalysisResult } from "@/lib/analyzeText";

// Allow up to 60 s for OCR (Vercel Pro / self-hosted)
export const maxDuration = 60;
// Never cache this route
export const dynamic = "force-dynamic";

/** Successful extraction + analysis payload. */
export interface ExtractResponse {
  text: string;
  wordCount: number;
  metadata:
    | { type: "pdf"; pageCount: number }
    | { type: "image"; width: number; height: number; confidence: number };
  analysis: AnalysisResult;
}

/** Error payload. */
export interface ExtractErrorResponse {
  error: string;
}

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(
  req: NextRequest
): Promise<NextResponse<ExtractResponse | ExtractErrorResponse>> {
  // ── Parse form data ────────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request — could not parse the uploaded file." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Please attach a PDF or image." },
      { status: 400 }
    );
  }

  // ── Validate type ──────────────────────────────────────────────────────────
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type "${file.type}". Only PDF, PNG, and JPEG are accepted.`,
      },
      { status: 415 }
    );
  }

  // ── Validate size ──────────────────────────────────────────────────────────
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 20 MB.` },
      { status: 413 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ── PDF path ───────────────────────────────────────────────────────────────
  if (file.type === "application/pdf") {
    try {
      const extracted = await extractPdfText(buffer);
      const analysis = analyzeText(extracted.text);
      const response: ExtractResponse = {
        text: extracted.text,
        wordCount: extracted.wordCount,
        metadata: { type: "pdf", pageCount: extracted.pageCount },
        analysis,
      };
      return NextResponse.json(response);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "PDF extraction failed." },
        { status: 422 }
      );
    }
  }

  // ── Image / OCR path ───────────────────────────────────────────────────────
  try {
    const extracted = await extractImageText(buffer, file.type);
    const analysis = analyzeText(extracted.text);
    const response: ExtractResponse = {
      text: extracted.text,
      wordCount: extracted.wordCount,
      metadata: {
        type: "image",
        width: extracted.dimensions.width,
        height: extracted.dimensions.height,
        confidence: extracted.confidence,
      },
      analysis,
    };
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "OCR failed." },
      { status: 422 }
    );
  }
}
