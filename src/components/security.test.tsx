import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { parseProgress, recordCompletion, EMPTY_PROGRESS } from "@/lib/game-logic";
import { games } from "@/lib/catalog";
import { GamePlayer } from "./game-player";
import { ProgressSummary } from "./progress-summary";
import { resetProgress, saveProgress, subscribeToProgress } from "@/lib/progress";

const key = "wonderlab.progress.v1";
const seeded = { version: 1, bestScores: { "binary-challenge": 80 }, completedGames: ["binary-challenge"] };
const encode = (changes: Record<string, unknown> = {}) => JSON.stringify({ ...seeded, ...changes });

beforeEach(() => window.localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe("untrusted progress boundary", () => {
  it("strips unused fields on write and preserves valid data when invalid writes fail", () => {
    const value = { version: 1 as const, bestScores: { "number-quest": 100 }, completedGames: ["number-quest"], practiceText: "synthetic-only" };
    expect(saveProgress(value)).toBe(true);
    const stored = window.localStorage.getItem(key);
    expect(JSON.parse(stored ?? "null")).toEqual({ version: 1, bestScores: { "number-quest": 100 }, completedGames: ["number-quest"] });
    for (const score of [NaN, Infinity, -Infinity, -1, 101]) {
      expect(saveProgress({ version: 1, bestScores: { "number-quest": score }, completedGames: ["number-quest"] })).toBe(false);
      expect(window.localStorage.getItem(key)).toBe(stored);
    }
  });
  it.each([
    "", "{", "null", "[]", "true", "1", '"text"',
    encode({ version: 2 }), encode({ bestScores: [] }),
    encode({ bestScores: { "binary-challenge": -1 } }),
    encode({ bestScores: { "binary-challenge": "100" } }),
    encode({ bestScores: { "binary-challenge": 101 } }),
    encode({ bestScores: { "reaction-challenge": 1001 } }),
    encode({ bestScores: { "unknown-game": 10 } }),
    encode({ completedGames: ["unknown-game"] }),
    encode({ completedGames: ["binary-challenge", "binary-challenge"] }),
    encode({ completedGames: ["<img src=x onerror=alert(1)>"] }),
    encode({ bestScores: { constructor: 10 } }),
    '{"version":1,"bestScores":{"__proto__":10},"completedGames":[]}',
    encode({ completedGames: [null] }),
    encode({ extra: "x".repeat(20_000) }),
  ])("rejects malformed or out-of-model record %# without throwing", (value) => {
    expect(parseProgress(value)).toBeNull();
  });

  it("keeps valid score boundaries and returns fresh empty state for missing data", () => {
    expect(parseProgress(null)).toEqual(EMPTY_PROGRESS);
    const value = { version: 1, bestScores: { "reaction-challenge": 1000, "number-quest": 100 }, completedGames: ["reaction-challenge", "number-quest"] };
    expect(parseProgress(JSON.stringify(value))).toEqual(value);
  });

  it("rejects out-of-model writes at the completion boundary", () => {
    expect(() => recordCompletion(EMPTY_PROGRESS, "unknown-game", 10)).toThrow(RangeError);
    expect(() => recordCompletion(EMPTY_PROGRESS, "number-quest", 101)).toThrow(RangeError);
    expect(() => recordCompletion(EMPTY_PROGRESS, "reaction-challenge", Infinity)).toThrow(RangeError);
  });
});

function startNumberQuest() {
  const game = games.find((item) => item.id === "number-quest");
  if (!game) throw new Error("Missing Number Quest fixture");
  render(<GamePlayer game={game} />);
  fireEvent.click(screen.getByRole("button", { name: "Start round" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "56" } });
}

describe("progress reset and concurrent sessions", () => {
  it("ignores unrelated storage events and removes subscriptions on cleanup", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToProgress(listener);
    fireEvent(window, new StorageEvent("storage", { key: "unrelated" }));
    expect(listener).not.toHaveBeenCalled();
    expect(saveProgress({ version: 1, bestScores: {}, completedGames: [] })).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    resetProgress();
    fireEvent(window, new StorageEvent("storage", { key }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("does not persist a completed round twice on repeated clicks", () => {
    const writes = vi.spyOn(Storage.prototype, "setItem");
    startNumberQuest();
    const button = screen.getByRole("button", { name: "Check answer" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(writes).toHaveBeenCalledTimes(1);
    expect(JSON.parse(window.localStorage.getItem(key) ?? "null").completedGames).toEqual(["number-quest"]);
  });
  it("does not resurrect previously cleared scores when an already-open game finishes", () => {
    window.localStorage.setItem(key, encode());
    startNumberQuest();
    render(<ProgressSummary />);
    fireEvent.click(screen.getByRole("button", { name: "Reset local progress" }));
    expect(window.localStorage.getItem(key)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(JSON.parse(window.localStorage.getItem(key) ?? "null")).toEqual({ version: 1, bestScores: { "number-quest": 100 }, completedGames: ["number-quest"] });
  });

  it("uses another session's latest scores even before its storage event arrives", () => {
    startNumberQuest();
    window.localStorage.setItem(key, encode({ bestScores: { "binary-challenge": 90 } }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(JSON.parse(window.localStorage.getItem(key) ?? "null").bestScores).toEqual({ "binary-challenge": 90, "number-quest": 100 });
  });

  it("updates a mounted summary for other-tab writes and storage clearing", () => {
    render(<ProgressSummary />);
    window.localStorage.setItem(key, encode());
    fireEvent(window, new StorageEvent("storage", { key, storageArea: window.localStorage }));
    expect(screen.getByText(/1 game completed on this device/)).toBeTruthy();
    window.localStorage.removeItem(key);
    fireEvent(window, new StorageEvent("storage", { key: null, storageArea: window.localStorage }));
    expect(screen.getByText(/No games completed/)).toBeTruthy();
  });

  it("clears an open game's stale personal-best display after same-tab reset", () => {
    const game = games.find((item) => item.id === "binary-challenge");
    if (!game) throw new Error("Missing Binary Challenge fixture");
    window.localStorage.setItem(key, encode());
    render(<GamePlayer game={game} />);
    expect(screen.getByText("Personal best on this device: 80")).toBeTruthy();
    fireEvent.click(render(<button onClick={() => resetProgress()}>Clear saved scores</button>).getByText("Clear saved scores"));
    expect(screen.queryByText("Personal best on this device: 80")).toBeNull();
  });

  it("keeps completion usable when storage reads and writes are denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    startNumberQuest();
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toMatch(/Correct/);
    expect(screen.getByText(/could not save progress/)).toBeTruthy();
  });

  it("reports quota failure without crashing or erasing unrelated state", () => {
    window.localStorage.setItem("unrelated", "keep");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    startNumberQuest();
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toMatch(/Correct/);
    expect(screen.getByText(/could not save progress/)).toBeTruthy();
    expect(window.localStorage.getItem("unrelated")).toBe("keep");
  });
});

describe("Memory Matrix sequence integrity", () => {
  it.each(["memory-matrix", "reaction-challenge"])("cancels delayed %s callbacks on reset", (id) => {
    vi.useFakeTimers();
    const game = games.find((item) => item.id === id);
    if (!game) throw new Error("Missing timed-game fixture");
    render(<GamePlayer game={game} />);
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset round" }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("button", { name: "Start round" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(/Round reset/);
    expect(window.localStorage.getItem(key)).toBeNull();
  });
  it("requires a complete correct sequence after a wrong first tile", () => {
    vi.useFakeTimers();
    const game = games.find((item) => item.id === "memory-matrix");
    if (!game) throw new Error("Missing Memory Matrix fixture");
    render(<GamePlayer game={game} />);
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    act(() => vi.advanceTimersByTime(1200));
    // Level one is Tile 3 then Tile 1. A wrong Tile 1 must not count as Tile 3.
    fireEvent.click(screen.getByRole("button", { name: "Tile 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Tile 1" }));
    expect(screen.getByRole("status").textContent).not.toMatch(/Level 2: watch/);
    expect(window.localStorage.getItem(key)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Tile 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Tile 1" }));
    expect(screen.getByRole("status").textContent).toMatch(/Level 2: watch/);
  });
});
