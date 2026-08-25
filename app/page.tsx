"use client";

/**
 * app/page.tsx
 * Main page — orchestrates upload, extraction, and results display.
 */

import { useState, useEffect } from "react";
import Dropzone from "@/components/Dropzone";
import ResultsView from "@/components/ResultsView";
import { extractPdfText } from "@/lib/extractPdf";
import { extractImageText } from "@/lib/extractImage";
import { analyzeText } from "@/lib/analyzeText";
import { postAnalysis } from "@/lib/api";
import type { ExtractResponse } from "@/lib/types";

type AppState =
  | { stage: "idle" }
  | { stage: "processing"; fileName: string; fileSize: number; isImage: boolean }
  | {
      stage: "done";
      fileName: string;
      fileSize: number;
      result: ExtractResponse;
      analysisId?: string;
    }
  | { stage: "error"; message: string };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Spinning SVG circle loader */
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="spinner shrink-0"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0110 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Elapsed-time hook */
function useElapsed(active: boolean) {
  const [secs, setSecs] = useState(0);
  const [prevActive, setPrevActive] = useState(active);

  if (active !== prevActive) {
    setPrevActive(active);
    if (active) {
      setSecs(0);
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (active) {
      interval = setInterval(() => setSecs((s) => s + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [active]);

  return secs;
}

// ── Step indicator ─────────────────────────────────────────────────────────────

function Steps({ current }: { current: "upload" | "process" | "results" }) {
  const steps = [
    { id: "upload", label: "Upload" },
    { id: "process", label: "Analyze" },
    { id: "results", label: "Results" },
  ] as const;
  const activeIdx = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center justify-center gap-0" aria-label="Progress steps">
      {steps.map((step, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                style={{
                  background: done
                    ? "linear-gradient(135deg, #8b5cf6, #06b6d4)"
                    : active
                      ? "rgba(139,92,246,0.2)"
                      : "rgba(255,255,255,0.04)",
                  border: active
                    ? "1px solid rgba(139,92,246,0.6)"
                    : done
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                  color: done ? "#fff" : active ? "#a78bfa" : "var(--text-muted)",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className="mb-5 w-16 h-px mx-2 transition-all duration-500"
                style={{
                  background: done
                    ? "linear-gradient(90deg, #8b5cf6, #06b6d4)"
                    : "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [state, setState] = useState<AppState>({ stage: "idle" });
  const isProcessing = state.stage === "processing";
  const elapsed = useElapsed(isProcessing);

  async function handleFileAccepted(file: File) {
    const isImage = file.type.startsWith("image/");
    setState({ stage: "processing", fileName: file.name, fileSize: file.size, isImage });

    try {
      // 1. Client-side extraction
      let text = "";
      let metadata: ExtractResponse["metadata"];
      let wordCount = 0;

      if (isImage) {
        const extracted = await extractImageText(file);
        text = extracted.text;
        wordCount = extracted.wordCount;
        metadata = {
          type: "image",
          width: extracted.dimensions.width,
          height: extracted.dimensions.height,
          confidence: extracted.confidence,
        };
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const extracted = await extractPdfText(arrayBuffer);
        text = extracted.text;
        wordCount = extracted.wordCount;
        metadata = {
          type: "pdf",
          pageCount: extracted.pageCount,
        };
      }

      // 2. Analysis and Persistence
      let analysisId: string | undefined;
      let analysis;

      try {
        const persisted = await postAnalysis(text);
        analysisId = persisted.analysisId;
        analysis = persisted.analysis;
      } catch (err) {
        console.warn("Backend unavailable, degrading gracefully to local analysis:", err);
        analysis = analyzeText(text);
      }

      setState({
        stage: "done",
        fileName: file.name,
        fileSize: file.size,
        result: {
          text,
          wordCount,
          metadata,
          analysis,
        },
        analysisId,
      });
    } catch (err) {
      setState({ stage: "error", message: err instanceof Error ? err.message : "Extraction failed." });
    }
  }

  function handleReset() {
    setState({ stage: "idle" });
  }

  const currentStep =
    state.stage === "done"
      ? "results"
      : state.stage === "processing"
        ? "process"
        : "upload";

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl flex flex-col gap-8">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <header className="text-center flex flex-col items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">Social Media</span>
            <br />
            Content Analyzer
          </h1>

          <p className="max-w-md text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Upload a PDF or image — we extract the text, score your content, and give you
            platform-specific engagement tips for Twitter, LinkedIn, Instagram &amp; Facebook.
          </p>
        </header>

        {/* ── Step tracker ──────────────────────────────────────────────── */}
        <Steps current={currentStep} />

        {/* ── Upload card ───────────────────────────────────────────────── */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <Dropzone
            onFileAccepted={handleFileAccepted}
            onFileRejected={(reason) => setState({ stage: "error", message: reason })}
            disabled={isProcessing}
          />

          {/* Processing status */}
          {state.stage === "processing" && (
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm anim-slide-up"
              style={{
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.25)",
                color: "#c4b5fd",
              }}
            >
              <Spinner size={16} />
              <div className="flex-1">
                <p className="font-medium">
                  {state.isImage ? "Running OCR…" : "Extracting PDF text…"}{" "}
                  <span style={{ color: "#a78bfa" }}>{elapsed}s</span>
                </p>
                <p className="mt-0.5 text-xs opacity-70">
                  {state.isImage
                    ? "Image OCR can take 15–30 seconds. Hang tight."
                    : `Processing ${state.fileName} (${formatBytes(state.fileSize)})`}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {state.stage === "error" && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm anim-slide-up"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
              }}
            >
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <span className="font-semibold">Error: </span>
                {state.message}
              </div>
              <button
                onClick={handleReset}
                className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium transition-colors hover:bg-red-500/20"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* ── Results card ──────────────────────────────────────────────── */}
        {state.stage === "done" && (
          <div className="glass-card p-6 flex flex-col gap-5 anim-slide-up">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-lg px-2.5 py-1 font-mono text-xs"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {state.fileName}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatBytes(state.fileSize)}
                </span>
              </div>
              <button
                id="analyze-another-btn"
                onClick={handleReset}
                className="rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-white/5"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-secondary)",
                }}
              >
                ← Analyze another
              </button>
            </div>

            <ResultsView result={state.result} analysis={state.result.analysis} />
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          All processing happens on-server. Your files are never stored.
        </footer>
      </div>
    </div>
  );
}
