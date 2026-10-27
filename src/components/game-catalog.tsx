"use client";

import { useEffect, useMemo, useState } from "react";
import { games } from "@/lib/catalog";

import { loadProgress, subscribeToProgress } from "@/lib/progress";
import { achievements, worldOf, worlds } from "@/lib/universe/discovery";

type GameCatalogProps = {
  compact?: boolean;
};

export function GameCatalog({ compact = false }: GameCatalogProps) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [world, setWorld] = useState("all");
  const [sort, setSort] = useState("Library order");
  const [daily, setDaily] = useState(0);
  useEffect(() => {
    const refresh = () => { const result = loadProgress(); setCompleted(result.ok ? result.data.completedGames : []); };
    refresh(); setDaily(Math.floor(Date.now() / 86400000) % games.length);
    return subscribeToProgress(refresh);
  }, []);
  const progress = achievements(completed, games);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All subjects");
  const [difficulty, setDifficulty] = useState("All levels");
  const visibleGames = useMemo(
    () =>
      [...games].filter((game) => {
        const text = `${game.title} ${game.description} ${game.category}`.toLowerCase();
        return (
          text.includes(query.trim().toLowerCase()) &&
          (world === "all" || worldOf(game) === world) &&
          (category === "All subjects" || game.category === category) &&
          (difficulty === "All levels" || game.difficulty === difficulty)
        );
      }).sort((a, b) => sort === "Title A–Z" ? a.title.localeCompare(b.title) : sort === "Difficulty" ? ["Warm-up", "Steady", "Stretch"].indexOf(a.difficulty) - ["Warm-up", "Steady", "Stretch"].indexOf(b.difficulty) : 0),
    [category, difficulty, query, world, sort],
  );

  return (
    <>
      <div className="universe-dashboard">
        <div><p className="eyebrow">Your discovery passport</p><h3>{games.length} games · Five worlds</h3><p>{progress.count} completed · {progress.xp} XP · Level {progress.level}</p><p>100 XP per unique completion. Level up every five games. Replays improve your personal best.</p><p>{progress.badges.length ? progress.badges.join(" · ") : "Complete a game to earn your first discovery badge."}</p><small>Progress stays in this browser. Games start fresh when reopened.</small></div>
        <div><p className="eyebrow">Daily discovery · UTC rotation</p><h3>Daily pick: {games[daily].title}</h3><p>{games[daily].objective}</p><a href={`/arcade/${games[daily].id}/`}>Try today's pick →</a><p>{completed.includes(games[daily].id) ? "Already completed on this browser." : "Ready to explore."} This pick rotates daily; it does not track daily activity.</p></div>
      </div>
      <div className="world-filters" aria-label="Game worlds">{[["all", "All worlds"], ...Object.entries(worlds)].map(([id, title]) => <button className="button button--quiet button--small" key={id} aria-pressed={world === id} onClick={() => setWorld(id)}>{title}</button>)}</div>
      <div className="filter-bar" aria-label="Filter games">
        <label className="field">
          Search games
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try binary or patterns"
            type="search"
            value={query}
          />
        </label>
        <label className="field">
          Subject
          <select aria-label="Subject" onChange={(event) => setCategory(event.target.value)} value={category}>
            {["All subjects", ...new Set(games.map((game) => game.category))].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </label>
        <label className="field">
          Level
          <select aria-label="Level"
            onChange={(event) => setDifficulty(event.target.value)}
            value={difficulty}
          >
            {["All levels", "Warm-up", "Steady", "Stretch"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="field">Sort<select aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)}>{["Library order", "Title A–Z", "Difficulty"].map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      <p className="filters-result" aria-live="polite">
        {visibleGames.length} {visibleGames.length === 1 ? "game" : "games"} to explore
      </p>
      {visibleGames.length > 0 ? (
        <div className="card-grid">
          {visibleGames.slice(0, compact ? 3 : undefined).map((game) => (
            <article className="card game-card" key={game.id}>
              <span className="card-icon" aria-hidden="true">
                {game.symbol}
              </span>
              <span className="card-tag">
                {game.category} · {game.difficulty}
              </span>
              <h3>{game.title}</h3>
              <p>{game.description}</p>
              <p><strong>Discover:</strong> {game.objective}</p>
              <small>{completed.includes(game.id) ? "Completed on this browser · Replay available" : "Ready to play"}</small>
              <a className="button button--quiet button--small" href={`/arcade/${game.id}/`}>
                Open game <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="callout" role="status">
          No games match those filters. Try a different search or level.
        </div>
      )}
      {compact && (
        <div className="button-row">
          <a className="button button--quiet" href="/arcade/">
            View all games
          </a>
        </div>
      )}
    </>
  );
}
