"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  binaryToDecimal,
  calculateTypingMetrics,
  EMPTY_PROGRESS,
  recordCompletion,
  type ProgressData,
} from "@/lib/game-logic";
import { loadProgress, saveProgress } from "@/lib/progress";
import type { GameDefinition } from "@/lib/catalog";

const MEMORY_LEVELS = [
  [2, 0],
  [2, 0, 3],
  [1, 3, 0, 2],
];
const TYPING_TEXT = "Small steps build clever solutions.";
const ALGORITHM_STEPS = [
  "Choose a clear goal",
  "Write instructions in order",
  "Test the result and improve it",
];
const ALGORITHM_OPTIONS = [...ALGORITHM_STEPS].reverse();
const NUMBER_QUESTIONS = {
  "Warm-up": { question: "7 × 8", answer: 56, explanation: "7 × 8 = 56." },
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
} as const;
type NumberDifficulty = keyof typeof NUMBER_QUESTIONS;

function isNumberDifficulty(value: string): value is NumberDifficulty {
  return Object.prototype.hasOwnProperty.call(NUMBER_QUESTIONS, value);
}
const WALLS = new Set(["1,1", "2,1"]);

type GamePlayerProps = {
  game: GameDefinition;
};

export function GamePlayer({ game }: GamePlayerProps) {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("Ready when you are.");
  const [feedbackKind, setFeedbackKind] = useState<"plain" | "error" | "success">(
    "plain",
  );
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState<ProgressData>(EMPTY_PROGRESS);
  const [storageMessage, setStorageMessage] = useState("");
  const [memoryPreview, setMemoryPreview] = useState(false);
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [memoryInputs, setMemoryInputs] = useState<number[]>([]);
  const [numberDifficulty, setNumberDifficulty] =
    useState<NumberDifficulty>("Warm-up");
  const [mazePosition, setMazePosition] = useState({ x: 0, y: 0 });
  const [mazeMoves, setMazeMoves] = useState(0);
  const [orderedSteps, setOrderedSteps] = useState<string[]>([]);
  const [typedText, setTypedText] = useState("");
  const [reactionWaiting, setReactionWaiting] = useState(false);
  const [reactionReady, setReactionReady] = useState(false);
  const [reactionResult, setReactionResult] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStartedAt = useRef<number | null>(null);
  const reactionStartedAt = useRef<number | null>(null);
  const memorySequence = MEMORY_LEVELS[memoryLevel - 1];

  useEffect(() => {
    const result = loadProgress();
    if (result.ok) {
      setProgress(result.data);
    } else {
      setStorageMessage(
        result.reason === "invalid"
          ? "Saved progress could not be read. This round still works; old data was left untouched."
          : "This browser has local storage turned off. You can still play; progress will not be saved.",
      );
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showFeedback = (
    message: string,
    kind: "plain" | "error" | "success" = "plain",
  ) => {
    setFeedback(message);
    setFeedbackKind(kind);
  };

  const finish = useCallback(
    (earnedScore: number, message: string) => {
      setCompleted(true);
      setScore(earnedScore);
      showFeedback(message, "success");
      try {
        const next = recordCompletion(progress, game.id, earnedScore);
        setProgress(next);
        setStorageMessage(
          saveProgress(next)
            ? `Personal best: ${next.bestScores[game.id]}. Saved only in this browser.`
            : "Round complete. This browser could not save progress, but you can keep playing.",
        );
      } catch {
        setStorageMessage("Round complete. Progress could not be updated.");
      }
    },
    [game.id, progress],
  );

  const resetRound = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStarted(false);
    setCompleted(false);
    setAnswer("");
    setScore(0);
    setMemoryPreview(false);
    setMemoryLevel(1);
    setMemoryInputs([]);
    setNumberDifficulty("Warm-up");
    setMazePosition({ x: 0, y: 0 });
    setMazeMoves(0);
    setOrderedSteps([]);
    setTypedText("");
    setReactionWaiting(false);
    setReactionReady(false);
    setReactionResult(null);
    typingStartedAt.current = null;
    reactionStartedAt.current = null;
    showFeedback("Round reset. Start when you are ready.");
  };

  const startRound = () => {
    resetRound();
    setStarted(true);
    if (game.id === "memory-matrix") {
      setMemoryPreview(true);
      showFeedback("Watch the tiles in order. The sequence will disappear shortly.");
      timerRef.current = setTimeout(() => {
        setMemoryPreview(false);
        showFeedback("Now repeat the sequence by selecting the tiles in order.");
      }, 1800);
    } else if (game.id === "reaction-challenge") {
      beginReaction();
    } else {
      showFeedback("Round started. Take your time and think it through.");
    }
  };

  const beginReaction = () => {
    setReactionWaiting(true);
    setReactionReady(false);
    setReactionResult(null);
    showFeedback("Wait for the green signal before you tap.");
    timerRef.current = setTimeout(
      () => {
        reactionStartedAt.current = performance.now();
        setReactionWaiting(false);
        setReactionReady(true);
        showFeedback("Go! Tap the signal.", "success");
      },
      900 + Math.floor(Math.random() * 1100),
    );
  };

  const moveMaze = useCallback(
    (dx: number, dy: number) => {
      if (!started || completed) return;
      const next = { x: mazePosition.x + dx, y: mazePosition.y + dy };
      if (next.x < 0 || next.x > 3 || next.y < 0 || next.y > 3) return;
      if (WALLS.has(`${next.x},${next.y}`)) {
        showFeedback("That square is blocked. Try another route.", "error");
        return;
      }
      const nextMoves = mazeMoves + 1;
      setMazePosition(next);
      setMazeMoves(nextMoves);
      if (next.x === 3 && next.y === 3) {
        finish(Math.max(10, 100 - nextMoves * 5), `Maze solved in ${nextMoves} moves.`);
      } else {
        showFeedback(`Moved. ${nextMoves} ${nextMoves === 1 ? "move" : "moves"} so far.`);
      }
    },
    [completed, finish, mazeMoves, mazePosition, started],
  );

  useEffect(() => {
    if (game.id !== "logic-maze") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)
      ) {
        return;
      }
      const moves: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        w: [0, -1],
        ArrowDown: [0, 1],
        s: [0, 1],
        ArrowLeft: [-1, 0],
        a: [-1, 0],
        ArrowRight: [1, 0],
        d: [1, 0],
      };
      const move = moves[event.key];
      if (move) {
        event.preventDefault();
        moveMaze(move[0], move[1]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.id, moveMaze]);

  const submitAnswer = () => {
    if (game.id === "number-quest") {
      const challenge = NUMBER_QUESTIONS[numberDifficulty];
      if (answer.trim() === String(challenge.answer)) {
        finish(100, `Correct: ${challenge.explanation}`);
      } else {
        showFeedback(
          `Not quite. Try breaking the multiplication into smaller parts. ${challenge.explanation}`,
          "error",
        );
      }
    } else if (game.id === "binary-challenge") {
      if (binaryToDecimal(answer) === 19) {
        finish(100, "Correct: 10011₂ = 16 + 2 + 1 = 19₁₀.");
      } else {
        showFeedback("Try grouping the place values: 16, 8, 4, 2, 1.", "error");
      }
    } else if (game.id === "pattern-detective") {
      if (answer.trim() === "48") {
        finish(100, "Correct: each term doubles, so 24 × 2 = 48.");
      } else {
        showFeedback("Look at how each term changes: 3 → 6 → 12 → 24.", "error");
      }
    }
  };

  const chooseMemoryTile = (index: number) => {
    if (!started || memoryPreview || completed) return;
    const next = [...memoryInputs, index];
    setMemoryInputs(next);
    if (memorySequence[next.length - 1] !== index) {
      showFeedback("That tile was not next in the sequence. Reset and try again.", "error");
      return;
    }
    if (next.length === memorySequence.length && memoryLevel < MEMORY_LEVELS.length) {
      const nextLevel = memoryLevel + 1;
      setMemoryLevel(nextLevel);
      setMemoryInputs([]);
      setMemoryPreview(true);
      showFeedback(`Level ${nextLevel}: watch the longer sequence.`);
      timerRef.current = setTimeout(() => {
        setMemoryPreview(false);
        showFeedback(`Level ${nextLevel}: repeat the sequence.`);
      }, 1800);
    } else if (next.length === memorySequence.length) {
      finish(100, "All three levels complete. Nice observation!");
    } else {
      showFeedback(`${next.length} of ${memorySequence.length} tiles correct.`);
    }
  };

  const chooseAlgorithmStep = (step: string) => {
    if (!started || completed || orderedSteps.includes(step)) return;
    const expected = ALGORITHM_STEPS[orderedSteps.length];
    if (step !== expected) {
      showFeedback(
        "Think about the process: decide what to solve before writing or testing steps.",
        "error",
      );
      return;
    }
    const next = [...orderedSteps, step];
    setOrderedSteps(next);
    if (next.length === ALGORITHM_STEPS.length) {
      finish(100, "Algorithm assembled: define, sequence, test, and improve.");
    } else {
      showFeedback(`${next.length} of ${ALGORITHM_STEPS.length} steps in place.`);
    }
  };

  const handleReactionTap = () => {
    if (reactionWaiting) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setReactionWaiting(false);
      showFeedback("Too soon! Wait for green, then start another round.", "error");
      return;
    }
    if (reactionReady && reactionStartedAt.current !== null) {
      const elapsed = Math.max(
        1,
        Math.round(performance.now() - reactionStartedAt.current),
      );
      setReactionResult(elapsed);
      setReactionReady(false);
      finish(Math.max(1, 1000 - elapsed), `Signal detected in ${elapsed} ms.`);
    }
  };

  return (
    <section className="game-shell" aria-labelledby="game-heading">
      <p className="eyebrow">
        {game.category} · Ages {game.ages} · {game.difficulty}
      </p>
      <h2 id="game-heading">{game.title}</h2>
      <p>{game.objective}</p>
      <div className="game-instructions">
        <strong>How to play:</strong> {game.instructions}
      </div>
      {!started ? (
        <button className="button button--bright" onClick={startRound} type="button">
          Start round
        </button>
      ) : (
        <div className="game-board">
          {game.id === "memory-matrix" && (
            <>
              <p className="game-score" aria-live="polite">
                {memoryPreview
                  ? `Level ${memoryLevel}: ${memorySequence.map((tile) => tile + 1).join(" · ")}`
                  : `Level ${memoryLevel} · ${memoryInputs.length} of ${memorySequence.length} selected`}
              </p>
              <div className="memory-grid" aria-label="Four memory tiles">
                {[0, 1, 2, 3].map((tile) => (
                  <button
                    aria-label={`Tile ${tile + 1}`}
                    className={`memory-tile${memoryPreview && memorySequence[0] === tile ? " memory-tile--active" : ""}`}
                    disabled={memoryPreview || completed}
                    key={tile}
                    onClick={() => chooseMemoryTile(tile)}
                    type="button"
                  >
                    {tile + 1}
                  </button>
                ))}
              </div>
            </>
          )}

          {["number-quest", "binary-challenge", "pattern-detective"].includes(
            game.id,
          ) && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitAnswer();
              }}
            >
              {game.id === "number-quest" && (
                <label className="field">
                  Multiplication level
                  <select
                    disabled={completed}
                    onChange={(event) => {
                      const level = event.target.value;
                      if (isNumberDifficulty(level)) setNumberDifficulty(level);
                    }}
                    value={numberDifficulty}
                  >
                    {Object.keys(NUMBER_QUESTIONS).map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </label>
              )}
              <p>
                {game.id === "number-quest" &&
                  `${NUMBER_QUESTIONS[numberDifficulty].question} = ?`}
                {game.id === "binary-challenge" && "Write 19 in binary."}
                {game.id === "pattern-detective" && "3, 6, 12, 24, __"}
              </p>
              <label className="field">
                Your answer
                <input
                  autoComplete="off"
                  className="text-input"
                  inputMode={
                    game.id === "binary-challenge" ? "numeric" : "decimal"
                  }
                  onChange={(event) => setAnswer(event.target.value)}
                  required
                  value={answer}
                />
              </label>
              <div className="button-row">
                <button className="button" disabled={completed} type="submit">
                  Check answer
                </button>
              </div>
            </form>
          )}

          {game.id === "logic-maze" && (
            <>
              <div
                aria-label="Four by four logic maze. Use the move buttons or arrow keys."
                className="maze-board"
                role="grid"
                tabIndex={0}
              >
                {Array.from({ length: 16 }, (_, index) => {
                  const x = index % 4;
                  const y = Math.floor(index / 4);
                  const isHere = mazePosition.x === x && mazePosition.y === y;
                  const isWall = WALLS.has(`${x},${y}`);
                  const isGoal = x === 3 && y === 3;
                  return (
                    <div
                      aria-label={
                        isHere
                          ? "Your position"
                          : isWall
                            ? "Blocked square"
                            : isGoal
                              ? "Goal"
                              : `Row ${y + 1}, column ${x + 1}`
                      }
                      className={`maze-cell${isWall ? " maze-cell--wall" : ""}${isGoal ? " maze-cell--goal" : ""}`}
                      key={`${x}-${y}`}
                      role="gridcell"
                    >
                      {isHere ? "●" : isGoal ? "★" : isWall ? "" : ""}
                    </div>
                  );
                })}
              </div>
              <p className="game-score">Moves: {mazeMoves} · Controls: arrows or WASD</p>
              <div className="direction-grid" aria-label="Maze movement controls">
                <button
                  aria-label="Move up"
                  disabled={completed}
                  onClick={() => moveMaze(0, -1)}
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label="Move left"
                  disabled={completed}
                  onClick={() => moveMaze(-1, 0)}
                  type="button"
                >
                  ←
                </button>
                <button
                  aria-label="Move down"
                  disabled={completed}
                  onClick={() => moveMaze(0, 1)}
                  type="button"
                >
                  ↓
                </button>
                <button
                  aria-label="Move right"
                  disabled={completed}
                  onClick={() => moveMaze(1, 0)}
                  type="button"
                >
                  →
                </button>
              </div>
            </>
          )}

          {game.id === "typing-sprint" && (
            <>
              <p className="callout">{TYPING_TEXT}</p>
              <label className="field">
                Type the sentence
                <textarea
                  autoComplete="off"
                  onChange={(event) => {
                    if (typingStartedAt.current === null) {
                      typingStartedAt.current = Date.now();
                    }
                    setTypedText(event.target.value);
                  }}
                  value={typedText}
                />
              </label>
              <p className="game-score">
                {calculateTypingMetrics(
                  TYPING_TEXT,
                  typedText,
                  typingStartedAt.current === null
                    ? 1
                    : (Date.now() - typingStartedAt.current) / 1000,
                ).accuracy}
                % character accuracy
              </p>
              <button
                className="button"
                disabled={completed || typedText.length === 0}
                onClick={() => {
                  const elapsed =
                    typingStartedAt.current === null
                      ? 1
                      : (Date.now() - typingStartedAt.current) / 1000;
                  const metrics = calculateTypingMetrics(
                    TYPING_TEXT,
                    typedText,
                    elapsed,
                  );
                  if (typedText !== TYPING_TEXT) {
                    showFeedback(
                      `Check the punctuation and spaces. Current accuracy: ${metrics.accuracy}%.`,
                      "error",
                    );
                    return;
                  }
                  finish(
                    metrics.accuracy,
                    `Exact match! ${metrics.accuracy}% accuracy at ${metrics.wordsPerMinute} words per minute.`,
                  );
                }}
                type="button"
              >
                Check typing
              </button>
              <p className="game-score">
                Your typed text is kept only in this round and is not saved.
              </p>
            </>
          )}

          {game.id === "algorithm-builder" && (
            <>
              <p>Choose the next useful step for solving a new problem.</p>
              <ol className="sequence-list">
                {orderedSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="challenge-options">
                {ALGORITHM_OPTIONS.map((step) => (
                  <button
                    className="challenge-option"
                    disabled={completed || orderedSteps.includes(step)}
                    key={step}
                    onClick={() => chooseAlgorithmStep(step)}
                    type="button"
                  >
                    {step}
                  </button>
                ))}
              </div>
            </>
          )}

          {game.id === "reaction-challenge" && (
            <>
              <button
                aria-label="Reaction signal; tap when green"
                className={`reaction-target${reactionReady ? " reaction-target--ready" : ""}`}
                disabled={!reactionWaiting && !reactionReady}
                onClick={handleReactionTap}
                type="button"
              >
                {reactionWaiting
                  ? "Wait…"
                  : reactionReady
                    ? "TAP NOW"
                    : reactionResult !== null
                      ? `${reactionResult} ms`
                      : "Ready"}
              </button>
              {!reactionWaiting && !reactionReady && !completed && (
                <button className="button button--quiet" onClick={beginReaction} type="button">
                  Start signal
                </button>
              )}
            </>
          )}
        </div>
      )}

      <p
        className="status-message"
        data-kind={feedbackKind}
        role="status"
        aria-live="polite"
      >
        {feedback}
      </p>
      {started && <p className="game-score">Round score: {score}</p>}
      {storageMessage && <p className="game-score">{storageMessage}</p>}
      <div className="button-row">
        <button className="button button--quiet" onClick={resetRound} type="button">
          Reset round
        </button>
        {completed && (
          <button className="button button--bright" onClick={startRound} type="button">
            Play again
          </button>
        )}
        <a className="button button--quiet" href="/arcade/">
          Back to games
        </a>
      </div>
      {progress.completedGames.includes(game.id) && (
        <p className="game-score">
          Personal best on this device: {progress.bestScores[game.id] ?? score}
        </p>
      )}
    </section>
  );
}
