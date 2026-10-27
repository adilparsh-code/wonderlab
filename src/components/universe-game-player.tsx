"use client";

import { Component, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { GameDefinition } from "@/lib/catalog";
import { recordCompletion } from "@/lib/game-logic";
import { emptyProgress, loadProgress, saveProgress } from "@/lib/progress";
import { loadUniverseBoard } from "./universe/board-loaders";
import type { BoardProps, UniverseFamily, RoundResult } from "@/lib/universe/types";

type DownloadState =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; Board: ComponentType<BoardProps> };

function DownloadedBoard({ family, onRetry, ...props }: BoardProps & { family: UniverseFamily; onRetry: () => void }) {
  const [download, setDownload] = useState<DownloadState>({ status: "loading" });
  useEffect(() => {
    let current = true;
    // Each mounted attempt owns its promise. Reset/unmount invalidates it;
    // only an explicit user action starts another attempt after a failure.
    Promise.resolve().then(() => current ? loadUniverseBoard(family) : undefined).then(
      Board => { if (current && Board) setDownload({ status: "ready", Board }); },
      () => { if (current) setDownload({ status: "failed" }); },
    );
    return () => { current = false; };
  }, [family]);
  if (download.status === "loading") return <p role="status">Loading game controls…</p>;
  if (download.status === "failed") return <div role="alert"><p>This game could not load. Retry when your connection is available, or reset the journey.</p><button className="button" onClick={onRetry}>Retry game</button></div>;
  const Board = download.Board;
  return <Board {...props} />;
}

class GameBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div role="alert">This game could not load. Reset the journey or return to the library.</div> : this.props.children;
  }
}

export function UniverseGamePlayer({ game }: { game: GameDefinition }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [passed, setPassed] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState("");
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const family = game.engine;
  const score = Math.max(40, 100 - mistakes * 10);
  const complete = passed && round === 2;
  function reset() {
    locked.current = false; setStarted(false); setRound(0); setMistakes(0);
    setPassed(false); setMessage(""); setSaved(""); setAttempt(n => n + 1);
    heading.current?.focus();
  }
  function result(value: RoundResult) {
    if (locked.current) return;
    setMessage(value.message);
    if (!value.correct) { setMistakes(n => n + 1); return; }
    locked.current = true; setPassed(true);
    if (round === 2) {
      const latest = loadProgress();
      const ok = saveProgress(recordCompletion(latest.ok ? latest.data : emptyProgress(), game.id, score));
      setSaved(ok ? "Completion saved on this browser." : "Storage is unavailable. Your result was not saved.");
    }
  }
  return <article className="universe-player">
    <a className="text-link" href="/arcade/">← Game library</a>
    <p className="eyebrow">{game.category} · {game.difficulty} · Three-stage journey</p>
    <h1 ref={heading} tabIndex={-1}>{game.title}</h1>
    <p>{game.description}</p>
    <div className="callout"><h2>Your mission</h2><p>{game.objective}</p><p>{game.instructions}</p></div>
    <p>Earn 100 points by finishing all three stages. Each unsuccessful check costs 10 points, down to 40. No time limit.</p>
    {!family ? <p role="alert">Game unavailable. Please choose another game.</p> : !started ? <button className="button" onClick={() => { setStarted(true); heading.current?.focus(); }}>Start journey</button> : <>
      <ol className="stage-track" aria-label="Journey stages">{[0, 1, 2].map(n => <li key={n} aria-current={n === round ? "step" : undefined}>Stage {n + 1}{n < round || (n === round && passed) ? " ✓" : ""}</li>)}</ol>
      <p>Stage {round + 1} of 3 · Potential score: {score}/100 · Unsuccessful checks: {mistakes}</p>
      <GameBoundary key={`${game.id}-${attempt}-${round}`}><DownloadedBoard family={family} gameId={game.id} round={round} disabled={passed} onResult={result} onRetry={() => { setAttempt(n => n + 1); heading.current?.focus(); }} /></GameBoundary>
      <p role="status">{message}</p>
      {passed && !complete && <button className="button" onClick={() => { locked.current = false; setRound(n => n + 1); setPassed(false); setMessage(""); heading.current?.focus(); }}>Next stage</button>}
      {complete && <div className="callout" data-testid="journey-complete"><h2>Journey complete</h2><p>Final score: {score}/100</p><p>{game.takeaway}</p><p>{saved}</p><button className="button" onClick={reset}>Play again</button></div>}
    </>}
    <div className="button-row"><button className="button button--quiet" onClick={reset}>Reset journey</button><a href="/arcade/">Choose another game</a></div>
  </article>;
}
