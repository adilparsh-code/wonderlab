import { expect, it } from "vitest";
import { games, validateCatalog } from "../catalog";
import { achievements, worldOf } from "./discovery";
it("registers exactly 42 new three-stage games in five families with unique mechanics and intact legacy routes", () => {
  const expanded = games.filter(g => g.engine);
  expect(expanded).toHaveLength(42);
  expect(new Set(expanded.map(g => g.mechanic)).size).toBe(42);
  expect(["space","science","coding","maths","strategy"].map(f=>expanded.filter(g=>g.engine===f).length)).toEqual([9,9,9,9,6]);
  expect(games.filter(g=>!g.engine).map(g=>g.id)).toEqual(["memory-matrix","number-quest","logic-maze","binary-challenge","pattern-detective","typing-sprint","algorithm-builder","reaction-challenge"]);
  expect(validateCatalog(games)).toEqual([]);
  for (const game of expanded) { expect(game.takeaway?.length).toBeGreaterThan(15); expect(game.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/); }
});
it("derives XP and levels only from unique known completions", () => {
  expect(achievements(["lunar-landing","lunar-landing","not-a-game"],games)).toEqual({count:1,xp:100,level:1,badges:["First discovery"]});
  expect(achievements(games.slice(0,5).map(g=>g.id),games).level).toBe(2);
  expect(achievements([],games).badges).toEqual([]);
});
it("requires actual five-world coverage for the explorer badge and all 50 for the library badge", () => {
  expect(achievements(["lunar-landing","atom-builder","robot-programmer","fraction-kitchen","eco-city-planner"],games).badges).toContain("Five worlds explorer");
  expect(achievements(games.map(g=>g.id),games).badges).toContain("Library explorer");
  expect(worldOf(games[0])).toBe("maths");
});
