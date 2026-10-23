import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, fireEvent } from "@testing-library/react";
import { GamePlayer } from "./game-player";
import { games } from "@/lib/catalog";

const numberQuestGame = games.find((g) => g.id === "number-quest")!;
const binaryGame = games.find((g) => g.id === "binary-challenge")!;
const patternGame = games.find((g) => g.id === "pattern-detective")!;
const algorithmGame = games.find((g) => g.id === "algorithm-builder")!;
const memoryGame = games.find((g) => g.id === "memory-matrix")!;

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("GamePlayer", () => {
  it("renders the game title, objective, and instructions", () => {
    render(<GamePlayer game={numberQuestGame} />);
    expect(screen.getByText("Number Quest")).toBeTruthy();
    expect(screen.getByText("Build fluency with multiplication and explain a calculation.")).toBeTruthy();
    const startButton = document.querySelector('button[type="button"]:has-text("Start round")');
    expect(startButton).toBeTruthy();
  });

  it("starts a round and shows the question", () => {
    render(<GamePlayer game={numberQuestGame} />);
    const startButton = document.querySelector('button[type="button"]:has-text("Start round")');
    fireEvent.click(startButton);
    expect(screen.getByText("7 × 8 = ?")).toBeTruthy();
  });

  it("accepts a correct number-quest answer and completes the round", async () => {
    render(<GamePlayer game={numberQuestGame} />);
    const startButton = document.querySelector('button[type="button"]:has-text("Start round")');
    fireEvent.click(startButton);

    // Select answer input using robust DOM query
    const input = document.querySelector('input[placeholder*="answer"]') || document.querySelector('input[aria-label*="answer"]');
    fireEvent.change(input!, { target: { value: "56" } });
    fireEvent.click(document.querySelector('button:has-text("Check")'));

    await waitFor(() => {
      expect(document.querySelector('[role="status"]')).textContent.toMatch(/Correct/);
    });
  });

  it("rejects a wrong number-quest answer", async () => {
    render(<GamePlayer game={numberQuestGame} />);
    const startButton = document.querySelector('button[type="button"]:has-text("Start round")');
    fireEvent.click(startButton);
    const input = document.querySelector('input[placeholder*="answer"]') || document.querySelector('input[aria-label*="answer"]');
    fireEvent.change(input!, { target: { value: "1" } });
    fireEvent.click(document.querySelector('button:has-text("Check")'));
    expect(document.querySelector('[role="status"]')).textContent.toMatch(/Not quite/);
  });

  it("accepts the correct binary answer for 19", async () => {
    render(<GamePlayer game={binaryGame} />);
    const startButton = document.querySelector('button[type="button"]:has-text("Start round")');
    fireEvent.click(startButton);
    const input = document.querySelector('input[placeholder*="answer"]') || document.querySelector('input[aria-label*="answer"]');
    fireEvent.change(input!, { target: { value: "10011" } });
    fireEvent.click(document.querySelector('button:has-text("Check")'));
    expect(document.querySelector('[role="status"]')).textContent.toMatch(/Correct/);
  });

  it("accepts the correct pattern answer (48)", async () => {
    render(<GamePlayer game={patternGame} />);
    fireEvent.click(document.querySelector('button[type="button"]:has-text("Start round")'));
    const input = document.querySelector('input[placeholder*="answer"]') || document.querySelector('input[aria-label*="answer"]');
    fireEvent.change(input!, { target: { value: "48" } });
    fireEvent.click(document.querySelector('button:has-text("Check")'));
    expect(document.querySelector('[role="status"]')).textContent.toMatch(/Correct/);
  });

  it("completes the algorithm builder when steps are chosen in order", async () => {
    render(<GamePlayer game={algorithmGame} />);
    fireEvent.click(document.querySelector('button[type="button"]:has-text("Start round")'));
    fireEvent.click(screen.getByText("Choose a clear goal"));
    fireEvent.click(screen.getByText("Write instructions in order"));
    fireEvent.click(screen.getByText("Test the result and improve it"));
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toMatch(/Algorithm assembled/);
    });
  });

  it("rejects algorithm steps chosen out of order", () => {
    render(<GamePlayer game={algorithmGame} />);
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    fireEvent.click(screen.getByText("Write instructions in order"));
    expect(screen.getByRole("status").textContent).toMatch(/Think about the process/);
  });

  it("allows reset and replay after completion", async () => {
    render(<GamePlayer game={patternGame} />);
    fireEvent.click(document.querySelector('button[type="button"]:has-text("Start round")'));
    const input = document.querySelector('input[placeholder*="answer"]') || document.querySelector('input[aria-label*="answer"]');
    fireEvent.change(input!, { target: { value: "48" } });
    fireEvent.click(document.querySelector('button:has-text("Check")'));
    await waitFor(() => {
      expect(document.querySelector('[role="status"]')).textContent.toMatch(/Correct/);
    });
    fireEvent.click(document.querySelector('button:has-text("Reset round")'));
    expect(screen.getByRole("button", { name: "Start round" })).toBeTruthy();
  });

  it("previews Memory Matrix tiles one at a time and completes and replays the sequence", () => {
    vi.useFakeTimers();
    render(<GamePlayer game={memoryGame} />);
    fireEvent.click(document.querySelector('button[type="button"]:has-text("Start round")'));

    expect(screen.getByRole("status").textContent).toMatch(/Watch the highlighted tiles/);
    expect(screen.getByRole("button", { name: "Tile 3" }).className).toContain(
      "memory-tile--active",
    );
    expect(document.body.textContent).not.toContain("3 · 1");
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Tile 3" }).disabled,
    ).toBe(true);

    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByRole("button", { name: "Tile 1" }).className).toContain(
      "memory-tile--active",
    );
    act(() => vi.advanceTimersByTime(600));
    expect(document.querySelector('[role="status"]')).textContent.toMatch(/Now repeat the sequence/);
    fireEvent.click(screen.getByRole("button", { name: "Tile 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Tile 1" }));

    expect(screen.getByRole("status").textContent).toMatch(/Level 2: watch/);
    expect(screen.getByRole("button", { name: "Tile 3" }).className).toContain(
      "memory-tile--active",
    );
    expect(document.body.textContent).not.toContain("3 · 1 · 4");
    act(() => vi.advanceTimersByTime(1800));
    fireEvent.click(screen.getByRole("button", { name: "Tile 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Tile 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Tile 4" }));

    expect(screen.getByRole("status").textContent).toMatch(/Level 3: watch/);
    expect(screen.getByRole("button", { name: "Tile 2" }).className).toContain(
      "memory-tile--active",
    );
    expect(document.body.textContent).not.toContain("2 · 4 · 1 · 3");
    act(() => vi.advanceTimersByTime(2400));
    fireEvent.click(screen.getByRole("button", { name: "Tile 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Tile 4" }));
    fireEvent.click(screen.getByRole("button", { name: "Tile 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Tile 3" }));

    expect(screen.getByRole("status").textContent).toMatch(/All three levels complete/);
    expect(screen.getByText("Round score: 100")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    expect(screen.getByRole("status").textContent).toMatch(/Watch the highlighted tiles/);
    expect(screen.getByRole("button", { name: "Tile 3" }).className).toContain(
      "memory-tile--active",
    );
    expect(document.body.textContent).not.toContain("3 · 1");
    fireEvent.click(screen.getByRole("button", { name: /Reset round/ }));
    expect(screen.getByRole("button", { name: "Start round" })).toBeTruthy();
  });
});