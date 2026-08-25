"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAnalysisById, type SavedAnalysis } from "@/lib/api";
import ResultsView from "@/components/ResultsView";

export default function HistoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getAnalysisById(id);
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen px-4 py-16 flex flex-col items-center gap-4">
        <div className="rounded-xl p-4 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
          {error || "Analysis not found"}
        </div>
        <Link href="/history" className="text-sm font-medium text-violet-400">
          &larr; Back to History
        </Link>
      </div>
    );
  }

  // Construct a faux ExtractResponse to feed into the ResultsView component
  // We don't have the original file metadata, so we use a dummy "history" type
  const resultObj = {
    text: analysis.extractedText,
    wordCount: analysis.wordCount,
    metadata: {
      type: "history" as any, // Bypass strict type check for display purposes
      date: new Date(analysis.createdAt).toLocaleString(),
    },
    analysis: {
      wordCount: analysis.wordCount,
      sentenceCount: analysis.sentenceCount,
      avgWordsPerSentence: analysis.readabilityScore,
      hashtagCount: analysis.hashtagCount,
      emojiCount: analysis.emojiCount,
      hasCta: analysis.hasCallToAction,
      overallScore: analysis.overallScore,
      suggestions: analysis.suggestions,
      platforms: analysis.platforms,
    },
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/history" className="text-sm font-medium text-slate-400 hover:text-slate-200">
            &larr; Back to History
          </Link>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10">
            {new Date(analysis.createdAt).toLocaleString()}
          </span>
        </div>
        
        <div className="glass-card p-6">
          <ResultsView result={resultObj as any} analysis={resultObj.analysis} />
        </div>
      </div>
    </div>
  );
}
