import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { CodingChallenges } from "./coding-challenges";

afterEach(cleanup);

describe("CodingChallenges", () => {
  it("renders all three coding prompts", () => {
    render(<CodingChallenges />);
    expect(screen.getByText(/What number is 1101₂ in decimal?/)).toBeTruthy();
    expect(screen.getByText(/IF it is raining/)).toBeTruthy();
    expect(screen.getByText(/clap” three times/)).toBeTruthy();
  });

  it("shows correct feedback for the right option", () => {
    render(<CodingChallenges />);
    const binaryCard = within(
      screen.getByRole("heading", { name: /What number is 1101₂/ }).closest("article")!,
    );
    fireEvent.click(binaryCard.getByText("13"));
    expect(screen.getByRole("status").textContent).toMatch(
      /Correct\. 8 \+ 4 \+ 0 \+ 1 = 13/,
    );
  });

  it("shows error feedback for the wrong option", () => {
    render(<CodingChallenges />);
    const binaryCard = within(
      screen.getByRole("heading", { name: /What number is 1101₂/ }).closest("article")!,
    );
    fireEvent.click(binaryCard.getByText("11"));
    expect(screen.getByRole("status").textContent).toMatch(/Try that idea again/);
  });

  it("resets when Try again is clicked", () => {
    render(<CodingChallenges />);
    const binaryCard = within(
      screen.getByRole("heading", { name: /What number is 1101₂/ }).closest("article")!,
    );
    fireEvent.click(binaryCard.getByText("11"));
    expect(screen.getByRole("status")).toBeTruthy();
    fireEvent.click(screen.getAllByText(/Try again/)[0]);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("evaluates the conditions prompt correctly", () => {
    render(<CodingChallenges />);
    const conditionsCard = within(
      screen.getByRole("heading", { name: /A program says/ }).closest("article")!,
    );
    fireEvent.click(conditionsCard.getByText("Take an umbrella"));
    expect(screen.getByRole("status").textContent).toMatch(/Correct/);
  });

  it("evaluates the loops prompt correctly", () => {
    render(<CodingChallenges />);
    const loopsCard = within(
      screen.getByRole("heading", { name: /A loop repeats/ }).closest("article")!,
    );
    fireEvent.click(loopsCard.getByText("Three"));
    expect(screen.getByRole("status").textContent).toMatch(/Correct/);
  });
});