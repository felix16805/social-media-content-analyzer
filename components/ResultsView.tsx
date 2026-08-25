"use client";

/**
 * ResultsView.tsx
 * Tabbed results panel: Overview → Platforms → Extracted Text.
 */

import { useState, useCallback } from "react";
import type { ExtractResponse } from "@/lib/types";
import type { AnalysisResult, Platform, Suggestion } from "@/lib/analyzeText";
import ScoreRing from "./ScoreRing";

interface ResultsViewProps {
  result: ExtractResponse;
  analysis: AnalysisResult;
}

type Tab = "overview" | "platforms" | "text";

// ── Suggestion icons ──────────────────────────────────────────────────────────

function SuggestionIcon({ icon }: { icon: Suggestion["icon"] }) {
  const paths: Record<Suggestion["icon"], string> = {
    words:
      "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
    hashtag:
      "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
    cta:
      "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
    readability:
      "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12",
    emoji:
      "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[icon]} />
    </svg>
  );
}

// ── Platform grid ─────────────────────────────────────────────────────────────

const PLATFORM_META: Record<Platform, { name: string; color: string; logo: string }> = {
  twitter:   { name: "X / Twitter",  color: "#1d9bf0", logo: "𝕏" },
  linkedin:  { name: "LinkedIn",     color: "#0a66c2", logo: "in" },
  instagram: { name: "Instagram",    color: "#e1306c", logo: "📸" },
  facebook:  { name: "Facebook",     color: "#1877f2", logo: "f" },
};

const FIT_ICON: Record<"good" | "warning" | "poor", { icon: string; cls: string }> = {
  good:    { icon: "✓", cls: "platform-good    text-emerald-400" },
  warning: { icon: "⚠", cls: "platform-warning text-amber-400" },
  poor:    { icon: "✕", cls: "platform-poor    text-red-400" },
};

// ── Stat cards ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      {sub && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

// ── Metadata bar ──────────────────────────────────────────────────────────────

function MetaBar({ result }: { result: ExtractResponse }) {
  const { metadata } = result;
  const items: { label: string; value: string }[] =
    metadata.type === "pdf"
      ? [
          { label: "Type", value: "PDF" },
          { label: "Pages", value: String(metadata.pageCount) },
          { label: "Words", value: result.wordCount.toLocaleString() },
        ]
      : [
          { label: "Type", value: "Image (OCR)" },
          ...(metadata.width
            ? [{ label: "Dimensions", value: `${metadata.width}×${metadata.height}px` }]
            : []),
          { label: "OCR Confidence", value: `${metadata.confidence}%` },
          { label: "Words", value: result.wordCount.toLocaleString() },
        ];

  return (
    <div
      className="flex flex-wrap gap-x-6 gap-y-1 rounded-xl px-4 py-3 text-sm"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {items.map(({ label, value }) => (
        <span key={label} style={{ color: "var(--text-secondary)" }}>
          <span style={{ color: "var(--text-muted)" }} className="mr-1">{label}:</span>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
        </span>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResultsView({ result, analysis }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied */
    }
  }, [result.text]);

  return (
    <div className="flex flex-col gap-5 anim-scale-in">
      <MetaBar result={result} />

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
        role="tablist"
      >
        {(["overview", "platforms", "text"] as Tab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn flex-1 capitalize ${activeTab === tab ? "active" : ""}`}
            id={`tab-${tab}`}
          >
            {tab === "overview" ? "Overview" : tab === "platforms" ? "Platforms" : "Extracted Text"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-5 anim-fade-in">
          {/* Score ring + stat cards */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={analysis.overallScore} />
            <div className="grid grid-cols-2 gap-3 flex-1 w-full">
              <StatCard
                label="Words"
                value={analysis.wordCount.toLocaleString()}
                sub={analysis.wordCount <= 280 ? "Tweet-length ✓" : analysis.wordCount <= 500 ? "Post-length" : "Long-form"}
              />
              <StatCard
                label="Sentences"
                value={analysis.sentenceCount}
                sub={`~${analysis.avgWordsPerSentence} words each`}
              />
              <StatCard
                label="Hashtags"
                value={analysis.hashtagCount}
                sub={analysis.hashtagCount === 0 ? "None found" : analysis.hashtagCount <= 5 ? "Balanced ✓" : "May be too many"}
              />
              <StatCard
                label="Emojis"
                value={analysis.emojiCount}
                sub={analysis.hasCta ? "CTA detected ✓" : "No CTA found"}
              />
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Suggestions
            </h2>
            <ul className="flex flex-col gap-2">
              {analysis.suggestions.map((s, i) => (
                <li
                  key={s.label}
                  className={`badge-${s.status} anim-slide-up anim-delay-${Math.min(i + 1, 5)} flex items-start gap-3 rounded-xl px-4 py-3 text-sm`}
                >
                  <span className="mt-0.5 opacity-80">
                    <SuggestionIcon icon={s.icon} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold">{s.label}: </span>
                    <span className="opacity-90">{s.message}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── PLATFORMS TAB ─────────────────────────────────────────────────── */}
      {activeTab === "platforms" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 anim-fade-in">
          {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
            const meta = PLATFORM_META[p];
            const assessment = analysis.platforms[p];
            const fitMeta = FIT_ICON[assessment.fit];
            return (
              <div
                key={p}
                className={`${fitMeta.cls} rounded-xl p-4 flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ background: meta.color }}
                    >
                      {meta.logo}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {meta.name}
                    </span>
                  </div>
                  <span className="text-base font-bold">{fitMeta.icon}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{assessment.reason}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EXTRACTED TEXT TAB ───────────────────────────────────────────── */}
      {activeTab === "text" && (
        <div className="flex flex-col gap-3 anim-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Extracted Text
            </h2>
            <button
              id="copy-text-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200"
              style={{
                background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.1)",
                color: copied ? "#34d399" : "var(--text-secondary)",
              }}
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy text
                </>
              )}
            </button>
          </div>
          <div
            className="max-h-96 overflow-y-auto rounded-xl p-4 custom-scroll"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <pre
              className="whitespace-pre-wrap text-sm leading-relaxed font-mono"
              style={{ color: "var(--text-secondary)" }}
            >
              {result.text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
