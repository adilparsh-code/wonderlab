import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UniverseGamePlayer } from "./universe-game-player";
import { games } from "@/lib/catalog";
import type { BoardProps } from "@/lib/universe/types";
vi.mock("./universe/space", () => ({ SpaceBoard: ({ disabled, onResult }: BoardProps) => <><button disabled={disabled} onClick={() => onResult({ correct: true, message: "Passed" })}>Solve</button><button disabled={disabled} onClick={() => onResult({ correct: false, message: "Try another plan" })}>Wrong</button></> }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });
const key = "wonderlab.progress.v1";
const candidate = games.find(game => game.id === "lunar-landing");
if (!candidate) throw new Error("Registered lunar game missing");
const game = candidate;
async function launch() { render(<UniverseGamePlayer game={game} />); fireEvent.click(screen.getByRole("button", { name: "Start journey" })); await screen.findByRole("button", { name: "Solve" }); }
async function finish() { for (let n = 0; n < 3; n++) { fireEvent.click(screen.getByRole("button", { name: "Solve" })); if (n < 2) { fireEvent.click(screen.getByRole("button", { name: "Next stage" })); await screen.findByRole("button", { name: "Solve" }); } } }
it("saves only after three successful stages, deducts mistakes and replays cleanly", async () => {
  await launch(); fireEvent.click(screen.getByRole("button", { name: "Wrong" }));
  expect(localStorage.getItem(key)).toBeNull();
  await finish(); expect(screen.getByText("Final score: 90/100")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem(key) ?? "{}").bestScores["lunar-landing"]).toBe(90);
  fireEvent.click(screen.getByRole("button", { name: "Play again" }));
  expect(screen.queryByTestId("journey-complete")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Start journey" })); await screen.findByRole("button", { name: "Solve" });
  expect(screen.getByText(/Stage 1 of 3 · Potential score: 100/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Reset journey" })); expect(screen.getByRole("button", { name: "Start journey" })).toBeTruthy();
});
it("rereads current storage so a reset does not resurrect old results", async () => {
  localStorage.setItem(key, JSON.stringify({ version: 1, bestScores: {"binary-challenge":90}, completedGames:["binary-challenge"] }));
  await launch(); localStorage.removeItem(key); await finish();
  expect(JSON.parse(localStorage.getItem(key) ?? "{}").completedGames).toEqual(["lunar-landing"]);
});
it("preserves another game's newer completion and a better previous score", async () => {
  await launch(); localStorage.setItem(key,JSON.stringify({version:1,bestScores:{"binary-challenge":90,"lunar-landing":100},completedGames:["binary-challenge","lunar-landing"]}));
  fireEvent.click(screen.getByRole("button", {name:"Wrong"}));await finish();
  expect(JSON.parse(localStorage.getItem(key) ?? "{}").bestScores).toEqual({"binary-challenge":90,"lunar-landing":100});
});
it("handles unavailable storage without blocking completion", async () => {
  await launch();vi.spyOn(Storage.prototype,"setItem").mockImplementation(()=>{throw new DOMException("denied");});await finish();expect(screen.getByText(/result was not saved/)).toBeTruthy();
});
it("recovers from corrupt stored data without evaluating it", async () => {
  await launch();localStorage.setItem(key,'{"version":99}');await finish();await waitFor(()=>expect(JSON.parse(localStorage.getItem(key) ?? "{}").version).toBe(1));
});
it("counts unique completions without inflating replay XP", async () => {
  await launch();await finish();fireEvent.click(screen.getByRole("button",{name:"Play again"}));fireEvent.click(screen.getByRole("button",{name:"Start journey"}));await screen.findByRole("button",{name:"Solve"});await finish();expect(JSON.parse(localStorage.getItem(key) ?? "{}").completedGames).toEqual(["lunar-landing"]);
});
