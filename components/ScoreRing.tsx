"use client";

/**
 * ScoreRing.tsx
 * Animated SVG circular progress ring displaying an overall content score.
 */

import { useEffect, useState } from "react";

interface ScoreRingProps {
  /** Score 0–100 */
  score: number;
  /** Ring diameter in px */
  size?: number;
  /** Stroke width in px */
  strokeWidth?: number;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#10b981"; // green
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function scoreLabel(score: number): string {
  if (score >= 70) return "Great";
  if (score >= 40) return "Fair";
  return "Needs work";
}

/**
 * Draws an animated circular progress ring that counts up from 0 to {@link score}.
 */
export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
}: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0);

  // Animate the number from 0 → score
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 900;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;
  const color = scoreColor(score);
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={`Content score: ${score} out of 100`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="ring-animate"
            style={{
              transition: "stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color, lineHeight: 1 }}
          >
            {displayed}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            / 100
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
          {scoreLabel(score)}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Content Score
        </p>
      </div>
    </div>
  );
}
