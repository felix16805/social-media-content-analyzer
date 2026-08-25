import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResultsView from "../ResultsView";
import type { ExtractResponse } from "@/lib/types";
import type { AnalysisResult } from "@/lib/analyzeText";

const mockAnalysis: AnalysisResult = {
  wordCount: 150,
  sentenceCount: 10,
  avgWordsPerSentence: 15,
  hashtagCount: 3,
  emojiCount: 1,
  hasCta: true,
  overallScore: 85,
  suggestions: [
    { label: "Word Count", message: "Looks good", status: "good", icon: "words" }
  ],
  platforms: {
    twitter: { fit: "good", reason: "Good fit" },
    linkedin: { fit: "good", reason: "Good fit" },
    instagram: { fit: "warning", reason: "Needs more hashtags" },
    facebook: { fit: "good", reason: "Good fit" },
  }
};

const mockResult: ExtractResponse = {
  text: "This is some test content.",
  wordCount: 150,
  metadata: { type: "pdf", pageCount: 1 },
  analysis: mockAnalysis,
};

jest.mock("../ScoreRing", () => {
  return function DummyScoreRing({ score }: { score: number }) {
    return <div data-testid="score-ring">{score}</div>;
  };
});

describe("ResultsView Component", () => {
  it("renders overview tab by default", () => {
    render(<ResultsView result={mockResult} analysis={mockAnalysis} />);
    
    // Check score ring
    expect(screen.getByTestId("score-ring")).toHaveTextContent("85");
    
    // Check stat cards
    expect(screen.getAllByText("150").length).toBeGreaterThan(0); // Words
    expect(screen.getByText("10")).toBeInTheDocument(); // Sentences
    
    // Check suggestions
    expect(screen.getByText(/Looks good/)).toBeInTheDocument();
  });

  it("switches to platforms tab", () => {
    render(<ResultsView result={mockResult} analysis={mockAnalysis} />);
    
    const platformsTab = screen.getByRole("tab", { name: /Platforms/i });
    fireEvent.click(platformsTab);
    
    expect(screen.getByText("X / Twitter")).toBeInTheDocument();
    expect(screen.getByText("Needs more hashtags")).toBeInTheDocument();
  });
});
