import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { GameCatalog } from "./game-catalog";
import { games } from "@/lib/catalog";

afterEach(cleanup);

describe("GameCatalog", () => {
  it("renders all eight games with links", () => {
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
    expect(document.body.textContent).toContain("8 games to explore");
  });

  it("limits to three games in compact mode", () => {
    const { container } = render(<GameCatalog compact />);
    const cards = container.querySelectorAll(".game-card");
    expect(cards.length).toBeLessThanOrEqual(3);
    expect(document.body.textContent).toContain("View all games");
  });
});