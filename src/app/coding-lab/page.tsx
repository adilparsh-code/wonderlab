import type { Metadata } from "next";
import { CodingChallenges } from "@/components/coding-challenges";

export const metadata: Metadata = {
  title: "Coding Lab",
  description: "Learn binary, algorithms, conditions, and loops with guided challenges.",
};

export default function CodingLabPage() {
  return (
    <div className="container">
      <header className="page-intro">
        <p className="eyebrow">Think like a programmer</p>
        <h1>Coding Lab</h1>
        <p>
          Start with the ideas behind code: represent information, give precise
          instructions, make decisions, and repeat useful steps. Answers are
          checked locally; no code is executed.
        </p>
      </header>
      <div className="callout callout--blue">
        <p>
          <strong>Starter example:</strong> IF a plant is dry, THEN water it.
          REPEAT that check every morning. A condition makes a choice; a loop
          repeats an instruction.
        </p>
        <p>
          <a className="text-link" href="/arcade/algorithm-builder/">
            Put algorithm steps in order →
          </a>
        </p>
      </div>
      <section className="section" aria-labelledby="coding-prompts">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Three quick checks</p>
            <h2 id="coding-prompts">Try an idea</h2>
          </div>
          <p>Choose an answer to get feedback, then replay whenever you like.</p>
        </div>
        <CodingChallenges />
      </section>
      <section className="section">
        <a className="button button--bright" href="/arcade/binary-challenge/">
          Play Binary Challenge
        </a>
      </section>
    </div>
  );
}
