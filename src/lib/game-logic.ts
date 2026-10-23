export function decimalToBinary(value: number): string {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError("Binary conversion requires a non-negative integer.");
  }
  return value.toString(2);
}

export function binaryToDecimal(value: string): number | null {
  const normalized = value.trim();
  if (!/^[01]+$/.test(normalized)) return null;
  return Number.parseInt(normalized, 2);
}

export function calculateTypingMetrics(
  target: string,
  typed: string,
  elapsedSeconds: number,
): { accuracy: number; wordsPerMinute: number } {
  const checkedLength = Math.min(target.length, typed.length);
  const correctCharacters = Array.from({ length: checkedLength }, (_, index) =>
    target[index] === typed[index] ? 1 : 0,
  ).reduce<number>((sum, value) => sum + value, 0);
  const accuracy =
    typed.length === 0 ? 0 : Math.round((correctCharacters / typed.length) * 100);
  const minutes = Math.max(elapsedSeconds, 1) / 60;
  const wordsPerMinute = Math.round(typed.length / 5 / minutes);
  return { accuracy, wordsPerMinute };
}

export type ProgressData = {
  version: 1;
  bestScores: Record<string, number>;
  completedGames: string[];
};

export const EMPTY_PROGRESS: ProgressData = {
  version: 1,
  bestScores: {},
  completedGames: [],
};

export function parseProgress(value: string | null): ProgressData | null {
  if (value === null) return { ...EMPTY_PROGRESS, bestScores: {}, completedGames: [] };
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== 1 ||
      !("bestScores" in parsed) ||
      typeof parsed.bestScores !== "object" ||
      parsed.bestScores === null ||
      Array.isArray(parsed.bestScores) ||
      !("completedGames" in parsed) ||
      !Array.isArray(parsed.completedGames) ||
      !parsed.completedGames.every((item) => typeof item === "string")
    ) {
      return null;
    }

    const bestScores: Record<string, number> = {};
    for (const [id, score] of Object.entries(parsed.bestScores)) {
      if (!id || typeof score !== "number" || !Number.isFinite(score) || score < 0) {
        return null;
      }
      bestScores[id] = score;
    }
    return { version: 1, bestScores, completedGames: parsed.completedGames };
  } catch {
    return null;
  }
}

export function recordCompletion(
  progress: ProgressData,
  gameId: string,
  score: number,
): ProgressData {
  if (!gameId.trim() || !Number.isFinite(score) || score < 0) {
    throw new RangeError("A game id and non-negative finite score are required.");
  }
  return {
    version: 1,
    bestScores: {
      ...progress.bestScores,
      [gameId]: Math.max(progress.bestScores[gameId] ?? 0, score),
    },
    completedGames: progress.completedGames.includes(gameId)
      ? progress.completedGames
      : [...progress.completedGames, gameId],
  };
}

export type NumberQuestLevel = "Warm-up" | "Steady" | "Stretch";

export type NumberQuestQuestion = {
  question: string;
  answer: number;
  explanation: string;
};

export const NUMBER_QUESTIONS: Record<NumberQuestLevel, NumberQuestQuestion> = {
  "Warm-up": {
    question: "7 × 8",
    answer: 56,
    explanation: "7 × 8 = 56.",
  },
  Steady: {
    question: "12 × 14",
    answer: 168,
    explanation: "12 × 14 = (12 × 10) + (12 × 4) = 120 + 48 = 168.",
  },
  Stretch: {
    question: "23 × 17",
    answer: 391,
    explanation: "23 × 17 = (23 × 10) + (23 × 7) = 230 + 161 = 391.",
  },
};

export function checkNumberQuestAnswer(
  level: NumberQuestLevel,
  answer: string,
): { correct: boolean } & NumberQuestQuestion {
  const challenge = NUMBER_QUESTIONS[level];
  return {
    correct: answer.trim() === String(challenge.answer),
    ...challenge,
  };
}

export function isCorrectBinaryChallenge(answer: string): boolean {
  return binaryToDecimal(answer) === 19;
}

export function isCorrectPatternDetective(answer: string): boolean {
  return answer.trim() === "48";
}

export function calculateMazeScore(moves: number): number {
  return Math.max(10, 100 - moves * 5);
}

export function calculateReactionScore(elapsedMs: number): number {
  return Math.max(1, 1000 - elapsedMs);
}

export const ALGORITHM_STEPS = [
  "Choose a clear goal",
  "Write instructions in order",
  "Test the result and improve it",
] as const;

export type AlgorithmStep = (typeof ALGORITHM_STEPS)[number];

export function nextAlgorithmStep(completedSteps: string[]): AlgorithmStep | null {
  if (completedSteps.length >= ALGORITHM_STEPS.length) return null;
  return ALGORITHM_STEPS[completedSteps.length];
}

export function isAlgorithmComplete(completedSteps: string[]): boolean {
  return completedSteps.length >= ALGORITHM_STEPS.length;
}
