"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, deleteAnalysis, type PaginatedResponse, type HistoryItemSummary } from "@/lib/api";

export default function HistoryPage() {
  const [data, setData] = useState<PaginatedResponse<HistoryItemSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchHistory = async (p: number) => {
    try {
      const result = await getHistory(p, 10);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory(page);
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    setLoading(true);
    try {
      await deleteAnalysis(id);
      fetchHistory(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Analysis History</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Review past content analyses and engagement suggestions.
          </p>
        </header>

        {error && (
          <div className="rounded-xl p-4 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : data?.items.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-3">
            <p style={{ color: "var(--text-muted)" }}>No analyses found.</p>
            <Link href="/" className="text-sm font-medium text-violet-400 hover:text-violet-300">
              Go analyze some content &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data?.items.map((item) => (
              <div
                key={item.id}
                className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:bg-white/[0.06]"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {item.overallScore} <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>/ 100</span>
                    </span>
                    <span className="h-4 w-px bg-white/10" />
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      {item.wordCount.toLocaleString()} words
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {item.suggestionsSummary.good > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.suggestionsSummary.good} Good
                      </span>
                    )}
                    {item.suggestionsSummary.warning > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.suggestionsSummary.warning} Warnings
                      </span>
                    )}
                    {item.suggestionsSummary.error > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                        {item.suggestionsSummary.error} Errors
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Link
                    href={`/history/${item.id}`}
                    className="rounded-lg px-4 py-2 text-sm font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    aria-label="Delete analysis"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => { setLoading(true); setPage(p => p - 1); }}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Page {page} of {data.totalPages}
                </span>
                <button
                  disabled={page === data.totalPages}
                  onClick={() => { setLoading(true); setPage(p => p + 1); }}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
