import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { ScienceExperiences } from "./science-experiences";

afterEach(cleanup);

describe("ScienceExperiences", () => {
  it("renders all six science topics", () => {
    render(<ScienceExperiences />);
    expect(screen.getByRole("heading", { name: "Electric circuits" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Gravity and falling" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "The water cycle" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Levers and simple machines" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "The solar system" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "How computers use binary" })).toBeTruthy();
  });

  it("renders a model limitation note for each topic", () => {
    const { container } = render(<ScienceExperiences />);
    expect(container.querySelectorAll(".science-card .game-score")).toHaveLength(6);
  });

  it("accepts a correct knowledge check answer", () => {
    render(<ScienceExperiences />);
    // Scope to the solar system card which has the Neptune question
    const solarCard = within(
      screen.getByRole("heading", { name: "The solar system" }).closest("article")!,
    );
    fireEvent.click(solarCard.getByRole("button", { name: "Neptune" }));
    expect(solarCard.getByText(/That’s right/).textContent).toMatch(/That’s right/);
  });

  it("rejects an incorrect knowledge check answer", () => {
    render(<ScienceExperiences />);
    const solarCard = within(
      screen.getByRole("heading", { name: "The solar system" }).closest("article")!,
    );
    fireEvent.click(solarCard.getByRole("button", { name: "Mercury" }));
    expect(solarCard.getByText(/Not quite/).textContent).toMatch(/Not quite/);
  });

  it("updates gravity time when the height slider changes", () => {
    render(<ScienceExperiences />);
    const slider = screen.getByLabelText(/Drop height/);
    fireEvent.change(slider, { target: { value: "30" } });
    expect(screen.getByText(/30 m → about/)).toBeTruthy();
  });

  it("shows binary place values for the binary computer model", () => {
    render(<ScienceExperiences />);
    expect(document.body.textContent).toContain("8 · 4 · 2 · 1");
  });
});