import { describe, expect, it } from "vitest";
import { games, scienceTopics, validateCatalog } from "./catalog";

describe("educational catalog", () => {
  it("has eight unique, complete playable games and six science models", () => {
    expect(games).toHaveLength(8);
    expect(new Set(games.map((game) => game.id)).size).toBe(games.length);
    expect(scienceTopics).toHaveLength(6);
    expect(validateCatalog(games)).toEqual([]);
  });

  it("reports duplicate IDs and missing required content", () => {
    const invalid = [
      { ...games[0], title: "" },
      { ...games[0], id: "memory-matrix" },
    ];
    expect(validateCatalog(invalid)).toEqual([
      "Missing title for game memory-matrix",
      "Duplicate game id: memory-matrix",
    ]);
  });
});
