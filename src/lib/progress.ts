"use client";

import {
  EMPTY_PROGRESS,
  parseProgress,
  type ProgressData,
} from "@/lib/game-logic";

const STORAGE_KEY = "wonderlab.progress.v1";

export type ProgressResult =
  | { ok: true; data: ProgressData }
  | { ok: false; reason: "unavailable" | "invalid" };

export function loadProgress(): ProgressResult {
  try {
    const parsed = parseProgress(window.localStorage.getItem(STORAGE_KEY));
    return parsed
      ? { ok: true, data: parsed }
      : { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export function saveProgress(data: ProgressData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function resetProgress(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function emptyProgress(): ProgressData {
  return { ...EMPTY_PROGRESS, bestScores: {}, completedGames: [] };
}
