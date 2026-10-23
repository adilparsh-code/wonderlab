import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenges",
  description: "Pick a themed mini challenge and practise a new idea.",
};

const challenges = [
  {
    title: "Number warm-up",
    text: "Use multiplication facts, then explain how you checked the answer.",
    game: "number-quest",
    label: "Open Number Quest",
  },
  {
    title: "Think in bits",
    text: "Try representing a familiar number using only zeroes and ones.",
    game: "binary-challenge",
    label: "Open Binary Challenge",
  },
  {
    title: "Plan before you move",
    text: "Find a route through a grid by breaking a goal into small steps.",
    game: "logic-maze",
    label: "Open Logic Maze",
  },
];

export default function ChallengesPage() {
  return (
    <div className="container">
      <header className="page-intro">
        <p className="eyebrow">Small goals, good thinking</p>
        <h1>Challenges</h1>
        <p>
          Choose a themed mini challenge. These are always available, repeatable
          activities—not a timed contest or a claim about your ability.
        </p>
      </header>
      <div className="card-grid">
        {challenges.map((challenge, index) => (
          <article className="card game-card" key={challenge.game}>
            <span className="card-tag">Challenge {index + 1}</span>
            <h2>{challenge.title}</h2>
            <p>{challenge.text}</p>
            <a className="button button--quiet button--small" href={`/arcade/${challenge.game}/`}>
              {challenge.label} →
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
