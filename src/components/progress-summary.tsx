"use client";

import { useEffect, useState } from "react";
import { loadProgress, resetProgress } from "@/lib/progress";

export function ProgressSummary() {
  const [summary, setSummary] = useState("Progress is stored only in this browser, if storage is available.");
  useEffect(() => {
    const result = loadProgress();
    if (!result.ok) {
      setSummary(
        result.reason === "invalid"
          ? "Saved progress is unreadable. Games remain available; existing data was not changed."
          : "Local storage is unavailable. Games remain available, but personal bests cannot be saved.",
      );
      return;
    }
    const count = result.data.completedGames.length;
    setSummary(
      count === 0
        ? "No games completed on this device yet. Your best scores stay here."
        : `${count} ${count === 1 ? "game" : "games"} completed on this device. Your scores stay here.`,
    );
  }, []);

  return (
    <div className="progress-panel" aria-live="polite">
      <p>{summary}</p>
      <button
        className="button button--quiet button--small"
        onClick={() =>
          setSummary(
            resetProgress()
              ? "Local WonderLab progress cleared from this browser."
              : "This browser could not clear local progress.",
          )
        }
        type="button"
      >
        Reset local progress
      </button>
    </div>
  );
}
