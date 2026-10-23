import { describe, expect, it } from "vitest";
import {
  ALGORITHM_STEPS,
  binaryToDecimal,
  calculateMazeScore,
  calculateReactionScore,
  calculateTypingMetrics,
  checkNumberQuestAnswer,
  decimalToBinary,
  EMPTY_PROGRESS,
  isAlgorithmComplete,
  isCorrectBinaryChallenge,
  isCorrectPatternDetective,
  nextAlgorithmStep,
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

describe("number quest answers", () => {
  it("validates correct answers for every difficulty", () => {
    expect(checkNumberQuestAnswer("Warm-up", "56").correct).toBe(true);
    expect(checkNumberQuestAnswer("Steady", "168").correct).toBe(true);
    expect(checkNumberQuestAnswer("Stretch", "391").correct).toBe(true);
  });

  it("rejects wrong answers", () => {
    expect(checkNumberQuestAnswer("Warm-up", "55").correct).toBe(false);
    expect(checkNumberQuestAnswer("Steady", "167").correct).toBe(false);
    expect(checkNumberQuestAnswer("Stretch", "390").correct).toBe(false);
  });

  it("ignores surrounding whitespace", () => {
    expect(checkNumberQuestAnswer("Warm-up", "  56  ").correct).toBe(true);
  });

  it("returns the question and explanation with the result", () => {
    const result = checkNumberQuestAnswer("Steady", "168");
    expect(result.question).toBe("12 × 14");
    expect(result.explanation).toContain("168");
  });
});

describe("binary challenge answer", () => {
  it("accepts 10011 as correct for 19", () => {
    expect(isCorrectBinaryChallenge("10011")).toBe(true);
    expect(isCorrectBinaryChallenge(" 10011 ")).toBe(true);
  });

  it("rejects wrong binary values", () => {
    expect(isCorrectBinaryChallenge("10010")).toBe(false);
    expect(isCorrectBinaryChallenge("")).toBe(false);
    expect(isCorrectBinaryChallenge("10a1")).toBe(false);
  });
});

describe("pattern detective answer", () => {
  it("accepts 48 as correct", () => {
    expect(isCorrectPatternDetective("48")).toBe(true);
    expect(isCorrectPatternDetective(" 48 ")).toBe(true);
  });

  it("rejects wrong answers", () => {
    expect(isCorrectPatternDetective("24")).toBe(false);
    expect(isCorrectPatternDetective("96")).toBe(false);
    expect(isCorrectPatternDetective("")).toBe(false);
  });
});

describe("maze score", () => {
  it("scores fewer moves higher, with a floor of 10", () => {
    expect(calculateMazeScore(1)).toBe(95);
    expect(calculateMazeScore(10)).toBe(50);
    expect(calculateMazeScore(18)).toBe(10);
    expect(calculateMazeScore(100)).toBe(10);
  });
});

describe("reaction score", () => {
  it("scores faster reactions higher, with a floor of 1", () => {
    expect(calculateReactionScore(100)).toBe(900);
    expect(calculateReactionScore(500)).toBe(500);
    expect(calculateReactionScore(999)).toBe(1);
    expect(calculateReactionScore(2000)).toBe(1);
  });
});

describe("algorithm steps", () => {
  it("returns the expected next step in order", () => {
    expect(nextAlgorithmStep([])).toBe("Choose a clear goal");
    expect(nextAlgorithmStep(["Choose a clear goal"])).toBe(
      "Write instructions in order",
    );
    expect(
      nextAlgorithmStep([
        "Choose a clear goal",
        "Write instructions in order",
      ]),
    ).toBe("Test the result and improve it");
  });

  it("returns null when all steps are complete", () => {
    expect(
      nextAlgorithmStep([
        "Choose a clear goal",
        "Write instructions in order",
        "Test the result and improve it",
      ]),
    ).toBeNull();
  });

  it("reports completion correctly", () => {
    expect(isAlgorithmComplete([])).toBe(false);
    expect(isAlgorithmComplete(["Choose a clear goal"])).toBe(false);
    expect(
      isAlgorithmComplete([
        "Choose a clear goal",
        "Write instructions in order",
        "Test the result and improve it",
      ]),
    ).toBe(true);
  });

  it("exports the ordered step list", () => {
    expect(ALGORITHM_STEPS).toEqual([
      "Choose a clear goal",
      "Write instructions in order",
      "Test the result and improve it",
    ]);
  });
});
