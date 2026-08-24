/**
 * extractImage.ts
 * Server-side image OCR using Tesseract.js v7.
 * Runs entirely in Node — no browser/canvas required.
 */

import { getImageDimensions } from "./imageSize";

/** Result returned by a successful OCR pass. */
export interface ImageExtractResult {
  text: string;
  dimensions: { width: number; height: number };
  wordCount: number;
  /** Tesseract confidence score 0–100. */
  confidence: number;
}

/** How long we wait for OCR before giving up (ms). */
const OCR_TIMEOUT_MS = 60_000;

/**
 * Runs Tesseract OCR on an image buffer and returns the extracted text.
 *
 * @param buffer   - Raw image bytes as a Node.js Buffer.
 * @param mimeType - MIME type of the image ("image/png" | "image/jpeg").
 * @returns An {@link ImageExtractResult} with OCR text and metadata.
 * @throws A descriptive Error on failure or timeout.
 */
export async function extractImageText(
  buffer: Buffer,
  mimeType: string
): Promise<ImageExtractResult> {
  const { createWorker } = await import("tesseract.js");

  // Read dimensions from the raw header before spawning the expensive worker
  const dimensions = getImageDimensions(buffer, mimeType);

  // OEM.LSTM_ONLY = 1 — use only the LSTM neural net engine (fastest, most accurate)
  const worker = await createWorker("eng", 1, {
    logger: () => {}, // silence progress output
  });

  // Race the OCR against a hard timeout to prevent hanging requests
  const ocrPromise = (async () => {
    try {
      const base64 = buffer.toString("base64");
      const dataUri = `data:${mimeType};base64,${base64}`;

      const { data } = await worker.recognize(dataUri);
      const { text, confidence } = data;

      if (!text || text.trim().length === 0) {
        throw new Error(
          "OCR returned no text. The image may be too low-resolution, " +
            "heavily compressed, or contain no readable characters."
        );
      }

      return {
        text: text.trim(),
        dimensions,
        wordCount: text.trim().split(/\s+/).filter(Boolean).length,
        confidence: Math.round(confidence),
      };
    } finally {
      // Always terminate the worker to free memory
      await worker.terminate().catch(() => {});
    }
  })();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("OCR timed out after 60 seconds. Try a smaller or higher-contrast image.")),
      OCR_TIMEOUT_MS
    )
  );

  return Promise.race([ocrPromise, timeoutPromise]);
}
