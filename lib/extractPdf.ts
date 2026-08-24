/**
 * extractPdf.ts
 * Server-side PDF text extraction using pdfjs-dist.
 * Uses disableWorker option (pdfjs v4+) — no Worker thread needed in Node.
 */

/** Result returned by a successful PDF extraction. */
export interface PdfExtractResult {
  text: string;
  pageCount: number;
  wordCount: number;
}

/**
 * Extracts all readable text from a PDF buffer page-by-page,
 * preserving line and paragraph structure as best as possible.
 *
 * @param buffer - Raw PDF bytes as a Node.js Buffer.
 * @returns A {@link PdfExtractResult} with concatenated text and metadata.
 * @throws A descriptive Error if parsing fails or the PDF has no text layer.
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  // Dynamic import keeps pdfjs-dist out of the client bundle
  const pdfjsLib = await import("pdfjs-dist");

  // Tell pdfjs not to spawn a Web Worker — we're in Node
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const uint8Array = new Uint8Array(buffer);

  let doc: Awaited<ReturnType<typeof pdfjsLib.getDocument>["promise"]>;
  try {
    const task = pdfjsLib.getDocument({
      data: uint8Array,
      // Suppress all network fetches — we're running in Node with no browser APIs
      useWorkerFetch: false,
      useSystemFonts: false,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
      disableFontFace: true,
      verbosity: 0,
    });
    doc = await task.promise;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.toLowerCase().includes("password")) {
      throw new Error("This PDF is password-protected. Please upload an unlocked file.");
    }
    throw new Error(
      "Could not parse the PDF. The file may be corrupt, encrypted, or not a valid PDF."
    );
  }

  const pageCount = doc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent({ includeMarkedContent: false });

    // Reconstruct lines by grouping items with the same vertical (y) position.
    // pdfjs items are in PDF coordinate space (bottom-left origin, y increases upward).
    // We group items whose y coordinates differ by less than the font size threshold.
    const lineMap = new Map<number, string[]>();

    for (const item of content.items) {
      if (!("str" in item) || !item.str) continue;
      // transform[5] is the y position, transform[3] is approximate font size
      const transform = (item as { str: string; transform: number[] }).transform;
      const rawY = transform[5];
      // Round to nearest 4 px bucket so small sub-pixel differences collapse
      const y = Math.round(rawY / 4) * 4;

      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push(item.str);
    }

    // Sort lines top-to-bottom (descending y in PDF space)
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
    const lines = sortedYs.map((y) => lineMap.get(y)!.join("").trim()).filter(Boolean);

    if (lines.length > 0) {
      pageTexts.push(lines.join("\n"));
    }
  }

  const text = pageTexts.join("\n\n").trim();

  if (!text) {
    throw new Error(
      "No text layer found in this PDF. It is likely a scanned document — " +
        "try uploading the individual page images for OCR."
    );
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return { text, pageCount, wordCount };
}
