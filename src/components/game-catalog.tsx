"use client";

import { useMemo, useState } from "react";
import { games } from "@/lib/catalog";

type GameCatalogProps = {
  compact?: boolean;
};

export function GameCatalog({ compact = false }: GameCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All subjects");
  const [difficulty, setDifficulty] = useState("All levels");
  const visibleGames = useMemo(
    () =>
      games.filter((game) => {
        const text = `${game.title} ${game.description} ${game.category}`.toLowerCase();
        return (
          text.includes(query.trim().toLowerCase()) &&
          (category === "All subjects" || game.category === category) &&
          (difficulty === "All levels" || game.difficulty === difficulty)
        );
      }),
    [category, difficulty, query],
  );

  return (
    <>
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
          <select onChange={(event) => setCategory(event.target.value)} value={category}>
            {["All subjects", ...new Set(games.map((game) => game.category))].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </label>
        <label className="field">
          Level
          <select
            onChange={(event) => setDifficulty(event.target.value)}
            value={difficulty}
          >
            {["All levels", "Warm-up", "Steady", "Stretch"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
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
