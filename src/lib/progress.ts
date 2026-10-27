"use client";

import {
  EMPTY_PROGRESS,
  parseProgress,
  type ProgressData,
} from "@/lib/game-logic";

const STORAGE_KEY = "wonderlab.progress.v1";
const CHANGE_EVENT = "wonderlab:progress-change";

export function subscribeToProgress(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

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
    const validated = parseProgress(JSON.stringify(data));
    if (!validated) return false;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function resetProgress(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function emptyProgress(): ProgressData {
  return { ...EMPTY_PROGRESS, bestScores: {}, completedGames: [] };
}
