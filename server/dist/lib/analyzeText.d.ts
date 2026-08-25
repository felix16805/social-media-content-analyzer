/**
 * analyzeText.ts
 * Rule-based social media content analysis engine.
 * No external AI API — all logic runs locally.
 */
/** Platform keys we support in the comparison grid. */
export type Platform = "twitter" | "linkedin" | "instagram" | "facebook";
/** A single platform assessment. */
export interface PlatformAssessment {
    /** Overall fit for this platform. */
    fit: "good" | "warning" | "poor";
    /** Short human-readable reason. */
    reason: string;
}
/** A single engagement suggestion. */
export interface Suggestion {
    label: string;
    message: string;
    status: "good" | "warning" | "error";
    /** Icon key for the UI (matches a set of SVG paths). */
    icon: "words" | "hashtag" | "cta" | "readability" | "emoji";
}
/** Full analysis result returned by {@link analyzeText}. */
export interface AnalysisResult {
    wordCount: number;
    sentenceCount: number;
    avgWordsPerSentence: number;
    hashtagCount: number;
    emojiCount: number;
    hasCta: boolean;
    /** 0–100 composite engagement score. */
    overallScore: number;
    suggestions: Suggestion[];
    /** Per-platform fit assessments. */
    platforms: Record<Platform, PlatformAssessment>;
}
/**
 * Analyzes extracted text and returns engagement suggestions + platform assessments.
 * All logic is local and rule-based — no network requests.
 *
 * @param text - Full extracted text from the uploaded file.
 * @returns An {@link AnalysisResult} with metrics, score, suggestions, and platform fit.
 */
export declare function analyzeText(text: string): AnalysisResult;
//# sourceMappingURL=analyzeText.d.ts.map