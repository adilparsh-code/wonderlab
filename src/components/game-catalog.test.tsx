import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { GameCatalog } from "./game-catalog";
import { games } from "@/lib/catalog";

afterEach(cleanup);

describe("GameCatalog", () => {
  it("renders all fifty games with links", () => {
    render(<GameCatalog />);
    for (const game of games) {
      expect(screen.getByText(game.title)).toBeDefined();
      expect(screen.getByText(game.description)).toBeDefined();
    }
    const openLinks = screen.getAllByRole("link", { name: /Open game/ });
    expect(openLinks.length).toBe(games.length);
  });

  it("filters by search query", () => {
    render(<GameCatalog />);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "binary" } });
    expect(screen.getByText("Binary Challenge")).toBeDefined();
    expect(screen.queryByText("Number Quest")).toBeNull();
  });

  it("filters by subject category", () => {
    render(<GameCatalog />);
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Maths" },
    });
    expect(screen.getByText("Number Quest")).toBeDefined();
    expect(screen.getByText("Pattern Detective")).toBeDefined();
    expect(screen.queryByText("Logic Maze")).toBeNull();
  });

  it("filters by difficulty level", () => {
    render(<GameCatalog />);
    fireEvent.change(screen.getByLabelText("Level"), {
      target: { value: "Warm-up" },
    });
    expect(screen.getByText("Number Quest")).toBeDefined();
    expect(screen.getByText("Typing Sprint")).toBeDefined();
    expect(screen.getByText("Algorithm Builder")).toBeDefined();
    expect(screen.queryByText("Logic Maze")).toBeNull();
  });

  it("shows no-match state when filters exclude all games", () => {
    render(<GameCatalog />);
    const search = screen.getByLabelText(/Search games/);
    fireEvent.change(search, { target: { value: "zzznope" } });
    expect(document.body.textContent).toContain("No games match those filters");
  });

  it("displays the visible game count in an aria-live region", () => {
    render(<GameCatalog />);
    expect(document.body.textContent).toContain("50 games to explore");
  });

  it("limits to three games in compact mode", () => {
    const { container } = render(<GameCatalog compact />);
    const cards = container.querySelectorAll(".game-card");
    expect(cards.length).toBeLessThanOrEqual(3);
    expect(document.body.textContent).toContain("View all games");
  });
});
it("filters five worlds and combines world, subject, difficulty and search", () => {
  render(<GameCatalog />);
  fireEvent.click(screen.getByRole("button",{name:"Space & Physics"}));
  expect(screen.getByText("Lunar Landing")).toBeTruthy();
  expect(screen.queryByText("Atom Builder")).toBeNull();
  fireEvent.change(screen.getByLabelText("Level"),{target:{value:"Warm-up"}});
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"lunar"}});
  expect(screen.getAllByRole("link",{name:/Open game/})).toHaveLength(1);
  fireEvent.change(screen.getByLabelText("Subject"),{target:{value:"Science"}});
  expect(screen.queryByRole("link",{name:/Open game/})).toBeNull();
});
it("sorts titles alphabetically without implying popularity",()=>{
  const {container}=render(<GameCatalog />);
  fireEvent.change(screen.getByLabelText("Sort"),{target:{value:"Title A–Z"}});
  const titles=[...container.querySelectorAll(".game-card h3")].map(el=>el.textContent??"");
  expect(titles).toEqual([...titles].sort((a,b)=>a.localeCompare(b)));
});
it("refreshes local completion status after a privacy reset",()=>{
  localStorage.setItem("wonderlab.progress.v1",JSON.stringify({version:1,bestScores:{"lunar-landing":100},completedGames:["lunar-landing"]}));
  render(<GameCatalog />);
  expect(screen.getByText(/1 completed · 100 XP/)).toBeTruthy();
  localStorage.removeItem("wonderlab.progress.v1");
  fireEvent(window,new StorageEvent("storage",{key:"wonderlab.progress.v1",newValue:null}));
  expect(screen.getByText(/0 completed · 0 XP/)).toBeTruthy();
});
