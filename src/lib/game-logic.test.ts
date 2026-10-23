import { describe, expect, it } from "vitest";
import {
  binaryToDecimal,
  calculateTypingMetrics,
  decimalToBinary,
  EMPTY_PROGRESS,
  parseProgress,
  recordCompletion,
} from "./game-logic";

describe("binary conversion", () => {
  it("converts decimal integers to binary", () => {
    expect(decimalToBinary(0)).toBe("0");
    expect(decimalToBinary(19)).toBe("10011");
  });

  it("rejects invalid decimal input", () => {
    expect(() => decimalToBinary(-1)).toThrow(RangeError);
    expect(() => decimalToBinary(1.5)).toThrow(RangeError);
  });

  it("converts valid binary and rejects malformed input", () => {
    expect(binaryToDecimal(" 10011 ")).toBe(19);
    expect(binaryToDecimal("")).toBeNull();
    expect(binaryToDecimal("10a1")).toBeNull();
  });
});

describe("typing metrics", () => {
  it("calculates character accuracy and a words-per-minute rate", () => {
    expect(calculateTypingMetrics("hello", "hello", 60)).toEqual({
      accuracy: 100,
      wordsPerMinute: 1,
    });
    expect(calculateTypingMetrics("hello", "hallo", 30).accuracy).toBe(80);
  });

  it("handles empty text and short elapsed times without invalid results", () => {
    expect(calculateTypingMetrics("hello", "", 0)).toEqual({
      accuracy: 0,
      wordsPerMinute: 0,
    });
  });
});

describe("local progress data", () => {
  it("returns a fresh empty schema for a missing value", () => {
    expect(parseProgress(null)).toEqual(EMPTY_PROGRESS);
  });

  it("accepts valid records and rejects malformed or unsupported data", () => {
    expect(
      parseProgress(
        JSON.stringify({
          version: 1,
          bestScores: { "logic-maze": 75 },
          completedGames: ["logic-maze"],
        }),
      ),
    ).toEqual({
      version: 1,
      bestScores: { "logic-maze": 75 },
      completedGames: ["logic-maze"],
    });
    expect(parseProgress("{")).toBeNull();
    expect(
      parseProgress(
        JSON.stringify({
          version: 2,
          bestScores: {},
          completedGames: [],
        }),
      ),
    ).toBeNull();
    expect(
      parseProgress(
        JSON.stringify({
          version: 1,
          bestScores: { broken: -2 },
          completedGames: [],
        }),
      ),
    ).toBeNull();
  });

  it("records a new best without lowering earlier scores or duplicating completions", () => {
    const first = recordCompletion(EMPTY_PROGRESS, "binary-challenge", 80);
    expect(recordCompletion(first, "binary-challenge", 50)).toEqual({
      version: 1,
      bestScores: { "binary-challenge": 80 },
      completedGames: ["binary-challenge"],
    });
    expect(() => recordCompletion(first, "", 1)).toThrow(RangeError);
  });
});
