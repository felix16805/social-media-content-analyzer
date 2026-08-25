/**
 * extractImage.ts
 * Client-side image OCR using Tesseract.js.
 */

export interface ImageExtractResult {
  text: string;
  dimensions: { width: number; height: number };
  wordCount: number;
  confidence: number;
}

const OCR_TIMEOUT_MS = 60_000;

export async function extractImageText(file: File): Promise<ImageExtractResult> {
  const { createWorker } = await import("tesseract.js");

  // Read dimensions using the browser's native Image object
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image to determine dimensions."));
    };
    img.src = url;
  });

  const worker = await createWorker("eng", 1, {
    logger: () => {}, // silence progress output
  });

  const ocrPromise = (async () => {
    try {
      const { data } = await worker.recognize(file);
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
