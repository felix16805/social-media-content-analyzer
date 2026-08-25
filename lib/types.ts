import type { AnalysisResult } from "./analyzeText";

export interface ExtractResponse {
  text: string;
  wordCount: number;
  metadata:
    | { type: "pdf"; pageCount: number }
    | { type: "image"; width: number; height: number; confidence: number };
  analysis: AnalysisResult;
}
