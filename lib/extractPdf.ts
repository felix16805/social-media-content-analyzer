/**
 * extractPdf.ts
 * Client-side PDF text extraction using pdfjs-dist.
 */

export interface PdfExtractResult {
  text: string;
  pageCount: number;
  wordCount: number;
}

/**
 * Extracts all readable text from a PDF ArrayBuffer page-by-page.
 *
 * @param buffer - Raw PDF bytes as an ArrayBuffer.
 * @returns A {@link PdfExtractResult}
 */
export async function extractPdfText(buffer: ArrayBuffer): Promise<PdfExtractResult> {
  // Dynamic import so it only loads on the client side
  const pdfjsLib = await import("pdfjs-dist");

  // Configure worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const uint8Array = new Uint8Array(buffer);

  let doc;
  try {
    const task = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      verbosity: 0,
    });
    doc = await task.promise;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.toLowerCase().includes("password")) {
      throw new Error("This PDF is password-protected. Please upload an unlocked file.");
    }
    throw new Error("Could not parse the PDF. The file may be corrupt or not a valid PDF.");
  }

  const pageCount = doc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent({ includeMarkedContent: false });

    const lineMap = new Map<number, string[]>();

    for (const item of content.items) {
      if (!("str" in item) || !item.str) continue;
      const transform = (item as { str: string; transform: number[] }).transform;
      const rawY = transform[5];
      const y = Math.round(rawY / 4) * 4;

      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push(item.str);
    }

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
