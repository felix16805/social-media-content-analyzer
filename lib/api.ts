/**
 * api.ts
 * Frontend fetch wrapper for the Express backend API.
 */

import type { AnalysisResult } from "./analyzeText";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface HistoryItemSummary {
  id: string;
  createdAt: string;
  wordCount: number;
  overallScore: number;
  suggestionsSummary: {
    good: number;
    warning: number;
    error: number;
  };
}

export interface SavedAnalysis {
  id: string;
  createdAt: string;
  extractedText: string;
  wordCount: number;
  sentenceCount: number;
  hashtagCount: number;
  emojiCount: number;
  hasCallToAction: boolean;
  readabilityScore: number;
  overallScore: number;
  suggestions: AnalysisResult["suggestions"];
  platforms: AnalysisResult["platforms"];
}

/**
 * Posts extracted text to the backend for analysis and persistence.
 * @param text The extracted text to analyze
 * @returns { analysisId, analysis }
 */
export async function postAnalysis(text: string): Promise<{ analysisId: string; analysis: AnalysisResult }> {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to analyze text on backend");
  }
  return res.json();
}

/**
 * Fetches a paginated list of past analyses.
 */
export async function getHistory(page = 1, limit = 10): Promise<PaginatedResponse<HistoryItemSummary>> {
  const res = await fetch(`${API_URL}/api/history?page=${page}&limit=${limit}`, {
    // Avoid Next.js caching this since it changes dynamically
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }
  return res.json();
}

/**
 * Fetches the full detail of a specific past analysis by ID.
 */
export async function getAnalysisById(id: string): Promise<SavedAnalysis> {
  const res = await fetch(`${API_URL}/api/history/${id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch analysis details");
  }
  return res.json();
}

/**
 * Deletes a past analysis by ID.
 */
export async function deleteAnalysis(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/history/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete analysis");
  }
}
