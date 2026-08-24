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

// ── Constants ─────────────────────────────────────────────────────────────────

const CTA_KEYWORDS = [
  "comment",
  "share",
  "link in bio",
  "follow",
  "subscribe",
  "click",
  "visit",
  "check out",
  "dm",
  "tag",
  "repost",
  "retweet",
  "sign up",
  "join",
  "save",
  "like",
  "learn more",
  "get started",
  "try now",
];

// Match most Unicode emoji ranges
const EMOJI_RE =
  /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;

// ── Helpers ───────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function countHashtags(text: string): number {
  return (text.match(/#\w+/g) ?? []).length;
}

function countEmojis(text: string): number {
  return (text.match(EMOJI_RE) ?? []).length;
}

function detectCta(text: string): boolean {
  const lower = text.toLowerCase();
  return CTA_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Computes an overall content score 0–100 from four weighted checks.
 * - Word count in a reasonable range: 30 pts
 * - Has CTA: 25 pts
 * - Readability (avg words/sentence ≤ 15): 25 pts
 * - Has hashtags (1–15): 20 pts
 */
function computeScore(
  words: number,
  avgWps: number,
  hashtagCount: number,
  hasCta: boolean
): number {
  let score = 0;

  // Word count
  if (words > 0 && words <= 280) score += 30;
  else if (words <= 500) score += 22;
  else if (words <= 2200) score += 14;
  else score += 5;

  // CTA
  if (hasCta) score += 25;

  // Readability
  if (avgWps <= 15) score += 25;
  else if (avgWps <= 25) score += 15;
  else score += 5;

  // Hashtags
  if (hashtagCount >= 1 && hashtagCount <= 5) score += 20;
  else if (hashtagCount <= 15) score += 12;
  else if (hashtagCount > 15) score += 4;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generates per-platform assessments based on content metrics.
 */
function assessPlatforms(
  words: number,
  hashtagCount: number,
  hasCta: boolean,
  emojiCount: number
): Record<Platform, PlatformAssessment> {
  // Twitter / X: ≤280 chars (rough: ≤60 words), 1–3 hashtags, CTAs ok
  const twitter: PlatformAssessment =
    words <= 60
      ? {
          fit: "good",
          reason: `${words} words fits a tweet. ${hashtagCount >= 1 && hashtagCount <= 3 ? "Good hashtag count." : "Aim for 1–2 hashtags."}`,
        }
      : words <= 150
      ? {
          fit: "warning",
          reason: "A bit long for a single tweet — consider splitting into a thread.",
        }
      : {
          fit: "poor",
          reason: "Too long for X/Twitter. Reformat as a thread or summarize.",
        };

  // LinkedIn: 150–1300 words, 3–5 hashtags, professional tone
  const linkedin: PlatformAssessment =
    words >= 80 && words <= 1300
      ? {
          fit: "good",
          reason: `${words} words is ideal for a LinkedIn post or article.`,
        }
      : words < 80
      ? { fit: "warning", reason: "LinkedIn posts perform better with 80+ words." }
      : {
          fit: words <= 2200 ? "warning" : "poor",
          reason:
            words <= 2200
              ? "Long for a post — consider publishing as a LinkedIn article."
              : "Too long even for a LinkedIn article. Break it up.",
        };

  // Instagram: short captions (<150 words), heavy emoji & hashtags
  const instagram: PlatformAssessment =
    words <= 150 && hashtagCount >= 5
      ? {
          fit: "good",
          reason: `Short caption with ${hashtagCount} hashtags — great for Instagram reach.`,
        }
      : words <= 150 && hashtagCount < 5
      ? {
          fit: "warning",
          reason: "Instagram captions benefit from 10–20 hashtags for discoverability.",
        }
      : {
          fit: "warning",
          reason: "Instagram captions should be concise (under 150 words). Trim or use 'read more'.",
        };

  // Facebook: 40–80 words is engagement sweet-spot; CTAs drive shares
  const facebook: PlatformAssessment =
    words >= 40 && words <= 500 && hasCta
      ? {
          fit: "good",
          reason: "Good length and has a CTA — well suited for Facebook.",
        }
      : words >= 40 && words <= 500
      ? {
          fit: "warning",
          reason: "Add a call-to-action to improve Facebook engagement.",
        }
      : {
          fit: words < 40 ? "warning" : "poor",
          reason:
            words < 40
              ? "Facebook posts under 40 words may underperform — add more context."
              : "Very long for a Facebook post. Consider adding a 'Read more' break.",
        };

  // Apply emoji bonus to Instagram
  if (emojiCount > 0 && instagram.fit === "warning" && words <= 150) {
    instagram.fit = "warning"; // emoji helps but hashtags still missing
  }

  return { twitter, linkedin, instagram, facebook };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Analyzes extracted text and returns engagement suggestions + platform assessments.
 * All logic is local and rule-based — no network requests.
 *
 * @param text - Full extracted text from the uploaded file.
 * @returns An {@link AnalysisResult} with metrics, score, suggestions, and platform fit.
 */
export function analyzeText(text: string): AnalysisResult {
  const words = countWords(text);
  const sentences = splitSentences(text);
  const sentenceCount = sentences.length;
  const avgWordsPerSentence =
    sentenceCount > 0 ? Math.round(words / sentenceCount) : 0;
  const hashtagCount = countHashtags(text);
  const emojiCount = countEmojis(text);
  const hasCta = detectCta(text);
  const overallScore = computeScore(words, avgWordsPerSentence, hashtagCount, hasCta);
  const platforms = assessPlatforms(words, hashtagCount, hasCta, emojiCount);

  const suggestions: Suggestion[] = [];

  // ── Word count ───────────────────────────────────────────────────────────
  if (words === 0) {
    suggestions.push({
      label: "Word Count",
      message: "No text detected. The file may be empty or contain only images.",
      status: "error",
      icon: "words",
    });
  } else if (words <= 280) {
    suggestions.push({
      label: "Word Count",
      message: `${words} words — ideal for short-form. Fits a tweet or Instagram caption.`,
      status: "good",
      icon: "words",
    });
  } else if (words <= 500) {
    suggestions.push({
      label: "Word Count",
      message: `${words} words — solid for LinkedIn or Facebook. Too long for X/Twitter.`,
      status: "warning",
      icon: "words",
    });
  } else if (words <= 2200) {
    suggestions.push({
      label: "Word Count",
      message: `${words} words — long-form territory. Good for LinkedIn articles; trim for feed posts.`,
      status: "warning",
      icon: "words",
    });
  } else {
    suggestions.push({
      label: "Word Count",
      message: `${words} words is very long. Repurpose into a thread, carousel, or bullet summary.`,
      status: "error",
      icon: "words",
    });
  }

  // ── Hashtags ─────────────────────────────────────────────────────────────
  if (hashtagCount === 0) {
    suggestions.push({
      label: "Hashtags",
      message: "No hashtags found. Add 3–5 relevant tags to improve discoverability.",
      status: "warning",
      icon: "hashtag",
    });
  } else if (hashtagCount <= 5) {
    suggestions.push({
      label: "Hashtags",
      message: `${hashtagCount} hashtag${hashtagCount > 1 ? "s" : ""} — a balanced amount for LinkedIn and X/Twitter.`,
      status: "good",
      icon: "hashtag",
    });
  } else if (hashtagCount <= 15) {
    suggestions.push({
      label: "Hashtags",
      message: `${hashtagCount} hashtags — fine for Instagram, but may look spammy on LinkedIn or X.`,
      status: "warning",
      icon: "hashtag",
    });
  } else {
    suggestions.push({
      label: "Hashtags",
      message: `${hashtagCount} hashtags is excessive on most platforms. Trim to 10 or fewer.`,
      status: "error",
      icon: "hashtag",
    });
  }

  // ── CTA ──────────────────────────────────────────────────────────────────
  suggestions.push({
    label: "Call to Action",
    message: hasCta
      ? "A CTA phrase was detected — great for driving engagement and interaction."
      : 'No CTA found. Add something like "comment below", "share this", or "follow for more".',
    status: hasCta ? "good" : "warning",
    icon: "cta",
  });

  // ── Readability ───────────────────────────────────────────────────────────
  if (avgWordsPerSentence === 0) {
    suggestions.push({
      label: "Readability",
      message: "Could not assess readability — no complete sentences found.",
      status: "warning",
      icon: "readability",
    });
  } else if (avgWordsPerSentence <= 15) {
    suggestions.push({
      label: "Readability",
      message: `Avg sentence length: ${avgWordsPerSentence} words — easy to scan on mobile. Well done.`,
      status: "good",
      icon: "readability",
    });
  } else if (avgWordsPerSentence <= 25) {
    suggestions.push({
      label: "Readability",
      message: `Avg sentence length: ${avgWordsPerSentence} words — moderate. Shorter sentences improve feed readability.`,
      status: "warning",
      icon: "readability",
    });
  } else {
    suggestions.push({
      label: "Readability",
      message: `Avg sentence length: ${avgWordsPerSentence} words — too dense for social feeds. Break into shorter sentences.`,
      status: "error",
      icon: "readability",
    });
  }

  // ── Emoji ────────────────────────────────────────────────────────────────
  suggestions.push({
    label: "Emoji Usage",
    message:
      emojiCount === 0
        ? "No emojis found. A few relevant emojis can make posts more engaging and eye-catching."
        : emojiCount <= 5
        ? `${emojiCount} emoji${emojiCount > 1 ? "s" : ""} — tasteful use. Good for visual scanning.`
        : `${emojiCount} emojis — on the heavy side. Ensure they reinforce (not clutter) your message.`,
    status: emojiCount === 0 ? "warning" : emojiCount <= 5 ? "good" : "warning",
    icon: "emoji",
  });

  return {
    wordCount: words,
    sentenceCount,
    avgWordsPerSentence,
    hashtagCount,
    emojiCount,
    hasCta,
    overallScore,
    suggestions,
    platforms,
  };
}
