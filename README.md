# Social Media Content Analyzer

Upload a PDF or image and instantly extract text, then get rule-based engagement suggestions tailored for social media platforms.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Drag-and-drop or click-to-browse upload (PDF, PNG, JPG — up to 20 MB)
- Server-side text extraction (pdfjs-dist for PDFs, Tesseract.js OCR for images)
- Rule-based engagement suggestions: word count flags, hashtag count, call-to-action detection, readability score
- Full TypeScript types throughout; logic split into focused `lib/` modules

## Approach

### PDF Parsing (`lib/extractPdf.ts`)

PDF files are parsed server-side using **pdfjs-dist** in legacy/Node mode (no Worker thread). Each page's `TextContent` items are grouped by their vertical `y`-coordinate to reconstruct line breaks, then pages are joined with double newlines to approximate paragraph structure. Encrypted or purely image-based PDFs throw a descriptive error.

### OCR (`lib/extractImage.ts`)

Images are processed server-side using **Tesseract.js** with the English language pack. The image buffer is converted to a Base64 data URI before being passed to the Tesseract worker, making it compatible with Next.js's Node.js API routes. The worker is terminated after each request to free memory. Tesseract reports a confidence score (0–100) that is surfaced in the results metadata.

### Suggestion Engine (`lib/analyzeText.ts`)

All analysis is local and rule-based — no external AI APIs. The engine checks:
1. **Word count** — flags text as ideal for X/Twitter (≤280 words), LinkedIn/Facebook (≤500), or long-form (>2200).
2. **Hashtags** — counts `#word` patterns; suggests 3–5 for best reach.
3. **Call-to-action** — keyword list check (e.g. "comment", "share", "follow", "link in bio").
4. **Readability** — average words per sentence; ≤15 words is mobile-friendly.

### Known Limitations

- **OCR accuracy**: Tesseract struggles with decorative fonts, very small text, or low-resolution scans. Confidence below ~60% usually means unreliable output.
- **Image-only PDFs**: pdfjs cannot extract text from scanned PDFs; the user sees a clear error message. A future improvement would be to auto-detect this and re-route through Tesseract.
- **Language support**: OCR is currently English-only.
- **Suggestion engine**: Rules are heuristic and platform-agnostic — a LinkedIn article and a tweet are assessed against the same thresholds unless the user selects a target platform (not yet implemented).

## Project Structure

```
app/
  page.tsx              # Main page (upload + results orchestration)
  layout.tsx            # Root layout + metadata
  api/
    extract/
      route.ts          # Thin POST handler — delegates to lib/
components/
  Dropzone.tsx          # react-dropzone upload UI
  ResultsView.tsx       # Suggestions + extracted text panel
lib/
  analyzeText.ts        # Rule-based suggestion engine
  extractPdf.ts         # pdfjs-dist PDF parser
  extractImage.ts       # Tesseract.js OCR
```
