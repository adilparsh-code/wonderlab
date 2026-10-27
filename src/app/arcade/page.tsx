import type { Metadata } from "next";
import { GameCatalog } from "@/components/game-catalog";
import { ProgressSummary } from "@/components/progress-summary";

export const metadata: Metadata = {
  title: "Learning Arcade",
  description: "Explore 50 free space, science, coding, maths, and strategy games in your browser.",
};

export default function ArcadePage() {
  return (
    <div className="container">
      <header className="page-intro">
        <p className="eyebrow">Choose a challenge</p>
        <h1>Learning Arcade</h1>
        <p>
          Short, replayable games where every challenge has a learning goal.
          No sign-in, downloads, or paid unlocks.
        </p>
      </header>
      <ProgressSummary />
      <GameCatalog />
    </div>
  );
}
