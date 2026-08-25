import { analyzeText } from "../analyzeText";

describe("analyzeText", () => {
  it("should handle empty strings", () => {
    const result = analyzeText("");
    expect(result.wordCount).toBe(0);
    expect(result.hashtagCount).toBe(0);
    expect(result.emojiCount).toBe(0);
    expect(result.hasCta).toBe(false);
    expect(result.overallScore).toBe(59); // 59 score for empty string
    expect(result.suggestions.some((s) => s.status === "error" && s.label === "Word Count")).toBe(true);
  });

  it("should calculate word count and sentence count", () => {
    const result = analyzeText("Hello world. This is a test.");
    expect(result.wordCount).toBe(6);
    expect(result.sentenceCount).toBe(2);
    expect(result.avgWordsPerSentence).toBe(3);
  });

  it("should detect hashtags", () => {
    const result = analyzeText("Hello #world this is #great");
    expect(result.hashtagCount).toBe(2);
  });

  it("should detect CTAs", () => {
    const result1 = analyzeText("Please comment below");
    expect(result1.hasCta).toBe(true);

    const result2 = analyzeText("Just a regular post");
    expect(result2.hasCta).toBe(false);
  });

  it("should detect emojis", () => {
    const result = analyzeText("Hello 🌍! It's a great day 🚀.");
    expect(result.emojiCount).toBe(2);
  });
});
