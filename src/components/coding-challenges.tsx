"use client";

import { useState } from "react";

type CodingPrompt = {
  id: string;
  concept: string;
  question: string;
  options: [string, string];
  correct: number;
  explanation: string;
};

const prompts: CodingPrompt[] = [
  {
    id: "binary",
    concept: "Binary",
    question: "What number is 1101₂ in decimal?",
    options: ["11", "13"],
    correct: 1,
    explanation: "8 + 4 + 0 + 1 = 13. Binary place values double from right to left.",
  },
  {
    id: "conditions",
    concept: "Conditions",
    question: "A program says: IF it is raining, THEN take an umbrella. It is raining. What follows?",
    options: ["Take an umbrella", "Skip the instruction"],
    correct: 0,
    explanation: "A condition checks whether something is true before choosing what to do.",
  },
  {
    id: "loops",
    concept: "Loops",
    question: "A loop repeats the command “clap” three times. How many claps?",
    options: ["Three", "One"],
    correct: 0,
    explanation: "A loop repeats its instructions the specified number of times.",
  },
];

function CodingPromptCard({ prompt }: { prompt: CodingPrompt }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <article className="card">
      <span className="card-tag">{prompt.concept}</span>
      <h3>{prompt.question}</h3>
      <div className="challenge-options">
        {prompt.options.map((option, index) => (
          <button
            aria-pressed={selected === index}
            className="challenge-option"
            key={option}
            onClick={() => setSelected(index)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
      {selected !== null && (
        <p className="status-message" data-kind={selected === prompt.correct ? "success" : "error"} role="status">
          {selected === prompt.correct ? "Correct. " : "Try that idea again. "}
          {prompt.explanation}
        </p>
      )}
      <button
        className="button button--quiet button--small"
        onClick={() => setSelected(null)}
        type="button"
      >
        Try again
      </button>
    </article>
  );
}

export function CodingChallenges() {
  return (
    <div className="card-grid">
      {prompts.map((prompt) => (
        <CodingPromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
