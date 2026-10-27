import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { UniverseGamePlayer } from "./universe-game-player";
import { SpaceBoard } from "./universe/space";
import { loadUniverseBoard } from "./universe/board-loaders";
import { games } from "@/lib/catalog";
import type { ComponentType } from "react";
import type { BoardProps } from "@/lib/universe/types";
vi.mock("./universe/board-loaders", () => ({ loadUniverseBoard: vi.fn() }));
const load = vi.mocked(loadUniverseBoard);
const candidate = games.find(game => game.id === "lunar-landing");
if (!candidate) throw new Error("Missing registered game");
const game = candidate;
afterEach(() => { cleanup(); vi.resetAllMocks(); localStorage.clear(); });
function deferred() {
  let resolve: (value: ComponentType<BoardProps>) => void = () => { throw new Error("Promise not initialized"); };
  let reject: (reason: Error) => void = () => { throw new Error("Promise not initialized"); };
  const promise = new Promise<ComponentType<BoardProps>>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function start() { fireEvent.click(screen.getByRole("button", { name: "Start journey" })); }
async function landAllStages() {
  for (let round = 0; round < 3; round++) {
    await screen.findByRole("button", { name: "Land craft" });
    fireEvent.change(screen.getByLabelText("High-altitude burn"), { target: { value: String(round + 2) } });
    fireEvent.change(screen.getByLabelText("Final landing burn"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Land craft" }));
    if (round < 2) fireEvent.click(screen.getByRole("button", { name: "Next stage" }));
  }
}
it("a failed module can be reset and loaded again, then genuinely completed", async () => {
  load.mockRejectedValueOnce(new Error("offline")).mockResolvedValue(SpaceBoard);
  render(<UniverseGamePlayer game={game} />); start();
  await screen.findByText(/This game could not load/);
  expect(localStorage.getItem("wonderlab.progress.v1")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Reset journey" })); start();
  await landAllStages();
  expect(screen.getByRole("heading", { name: "Journey complete" })).toBeTruthy();
  expect(JSON.parse(localStorage.getItem("wonderlab.progress.v1") ?? "{}").bestScores["lunar-landing"]).toBe(100);
});
it("retries only when requested, tolerates repeated failures and mounts one playable board", async () => {
  load.mockRejectedValueOnce(new Error("offline")).mockRejectedValueOnce(new Error("still offline")).mockResolvedValue(SpaceBoard);
  const { container } = render(<UniverseGamePlayer game={game} />); start();
  await screen.findByRole("button", { name: "Retry game" });
  expect(load).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Retry game" }));
  await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  await screen.findByRole("button", { name: "Retry game" });
  fireEvent.click(screen.getByRole("button", { name: "Retry game" }));
  await screen.findByRole("button", { name: "Land craft" });
  expect(container.querySelectorAll("fieldset")).toHaveLength(1);
  expect(load).toHaveBeenCalledTimes(3);
});
it("ignores a stale rejection after reset starts and completes a newer load", async () => {
  const old = deferred(); load.mockReturnValueOnce(old.promise).mockResolvedValue(SpaceBoard);
  render(<UniverseGamePlayer game={game} />); start();
  await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: "Reset journey" })); start();
  await screen.findByRole("button", { name: "Land craft" });
  await act(async () => { old.reject(new Error("late failure")); });
  expect(screen.queryByText(/This game could not load/)).toBeNull();
  await landAllStages(); expect(screen.getByRole("heading", { name: "Journey complete" })).toBeTruthy();
});
it("ignores stale success after leaving and does not initialize another game", async () => {
  const pending = deferred(); load.mockReturnValue(pending.promise);
  const view = render(<UniverseGamePlayer game={game} />); start();
  await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  view.rerender(<p>Library screen</p>);
  await act(async () => { pending.resolve(SpaceBoard); });
  expect(screen.getByText("Library screen")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Land craft" })).toBeNull();
  expect(localStorage.getItem("wonderlab.progress.v1")).toBeNull();
});
it("ignores an old successful response while a newer load is still pending", async () => {
  const old = deferred(); const current = deferred(); load.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
  render(<UniverseGamePlayer game={game} />); start();await waitFor(()=>expect(load).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: "Reset journey" })); start();await waitFor(()=>expect(load).toHaveBeenCalledTimes(2));
  await act(async () => { old.resolve(SpaceBoard); });
  expect(screen.queryByRole("button", { name: "Land craft" })).toBeNull();
  await act(async () => { current.resolve(SpaceBoard); });
  expect(screen.getByRole("button", { name: "Land craft" })).toBeTruthy();
});
it("does not start a queued module initialization after immediately leaving", async () => {
  load.mockResolvedValue(SpaceBoard);
  const view = render(<UniverseGamePlayer game={game} />); start();
  view.rerender(<p>Library screen</p>);
  await act(async () => {});
  expect(load).not.toHaveBeenCalled();
  expect(screen.getByText("Library screen")).toBeTruthy();
});
