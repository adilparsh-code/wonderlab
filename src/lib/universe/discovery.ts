import type { GameDefinition } from "../catalog";
export const worlds = { space: "Space & Physics", science: "Science Lab", coding: "Coding & Logic", maths: "Maths & Brain", strategy: "Adventure & Strategy" };
export function worldOf(game: GameDefinition): keyof typeof worlds {
  return game.engine ?? (game.category === "Maths" || game.category === "Focus" ? "maths" : "coding");
}
export function achievements(ids: string[], catalog: GameDefinition[]) {
  const completed = catalog.filter(game => ids.includes(game.id));
  const count = completed.length;
  return { count, xp: count * 100, level: 1 + Math.floor(count / 5), badges: [
    ...(count >= 1 ? ["First discovery"] : []),
    ...(count >= 10 ? ["Ten journeys"] : []),
    ...(new Set(completed.map(worldOf)).size === 5 ? ["Five worlds explorer"] : []),
    ...(count === catalog.length ? ["Library explorer"] : []),
  ] };
}
