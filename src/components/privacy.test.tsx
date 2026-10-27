import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import PrivacyPage from "@/app/privacy/page";
import { ProgressSummary } from "./progress-summary";
import { GamePlayer } from "./game-player";
import { CodingChallenges } from "./coding-challenges";
import { ScienceExperiences } from "./science-experiences";
import { GameCatalog } from "./game-catalog";
import { SiteFooter } from "./site-footer";
import { games } from "@/lib/catalog";
import { loadProgress } from "@/lib/progress";

const key = "wonderlab.progress.v1";

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("privacy controls and educational data", () => {
  it("offers the privacy policy from the footer without collecting details", () => {
    const { container } = render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Privacy" }).getAttribute("href")).toBe("/privacy/");
    expect(container.querySelector("form, input, textarea, iframe, script")).toBeNull();
  });

  it("explains the child privacy commitment and hosting limitation without a sign-up form", () => {
    const { container } = render(<PrivacyPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Privacy" })).toBeTruthy();
    expect(container.textContent).toMatch(/do not intentionally collect personal data from visitors aged 11–18/i);
    expect(container.textContent).toMatch(/IP addresses/);
    expect(container.textContent).toMatch(/not verified/);
    expect(container.querySelector("form, input, textarea, iframe, script")).toBeNull();
  });

  it("clears only WonderLab progress directly from the privacy page", () => {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, bestScores: { "number-quest": 100 }, completedGames: ["number-quest"] }));
    window.localStorage.setItem("unrelated-preference", "keep");
    render(<PrivacyPage />);
    fireEvent.click(screen.getByRole("button", { name: "Reset local progress" }));
    expect(window.localStorage.getItem(key)).toBeNull();
    expect(window.localStorage.getItem("unrelated-preference")).toBe("keep");
    expect(loadProgress()).toEqual({ ok: true, data: { version: 1, bestScores: {}, completedGames: [] } });
    expect(screen.getByText("Local WonderLab progress cleared from this browser.")).toBeTruthy();
  });

  it("can remove malformed progress without first parsing it", () => {
    window.localStorage.setItem(key, "{");
    render(<ProgressSummary />);
    expect(screen.getByText(/Saved progress is unreadable/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset local progress" }));
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it("reports failure rather than claiming deletion when storage is blocked", () => {
    window.localStorage.setItem(key, "{");
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    render(<ProgressSummary />);
    fireEvent.click(screen.getByRole("button", { name: "Reset local progress" }));
    expect(screen.getByText("This browser could not clear local progress.")).toBeTruthy();
    expect(window.localStorage.getItem(key)).toBe("{");
  });

  it("stores only a numeric best score and game ID when a game completes, without transmitting answers", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const send = vi.spyOn(XMLHttpRequest.prototype, "send");
    const game = games.find((item) => item.id === "number-quest");
    if (!game) throw new Error("Number Quest fixture missing");
    render(<GamePlayer game={game} />);
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "56" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toMatch(/Correct/);
    expect(JSON.parse(window.localStorage.getItem(key) ?? "null")).toEqual({ version: 1, bestScores: { "number-quest": 100 }, completedGames: ["number-quest"] });
    expect(window.localStorage.length).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("keeps typing input out of persistent storage and clears it on reset", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const game = games.find((item) => item.id === "typing-sprint");
    if (!game) throw new Error("Typing Sprint fixture missing");
    render(<GamePlayer game={game} />);
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Type the sentence" }), { target: { value: "practice-only sample" } });
    fireEvent.click(screen.getByRole("button", { name: "Check typing" }));
    expect(window.localStorage.length).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Reset round" }));
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Type the sentence" }).value).toBe("");
    fireEvent.change(screen.getByRole("textbox", { name: "Type the sentence" }), { target: { value: "Small steps build clever solutions." } });
    fireEvent.click(screen.getByRole("button", { name: "Check typing" }));
    expect(screen.getByRole("status").textContent).toMatch(/Exact match/);
    expect(JSON.parse(window.localStorage.getItem(key) ?? "null")).toEqual({ version: 1, bestScores: { "typing-sprint": 100 }, completedGames: ["typing-sprint"] });
    expect(window.localStorage.length).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("evaluates coding, science and search interactions locally without persistent profiles", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const send = vi.spyOn(XMLHttpRequest.prototype, "send");
    const { container } = render(<><CodingChallenges /><ScienceExperiences /><GameCatalog /></>);
    fireEvent.click(screen.getByRole("button", { name: "13" }));
    expect(screen.getByText(/Correct\. 8 \+ 4/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close the switch" }));
    expect(screen.getByText(/lamp is on/)).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "binary" } });
    expect(screen.queryByRole("link", { name: /Number Quest/ })).toBeNull();
    expect(screen.getAllByRole("link", { name: /Open game/ }).map(link => link.getAttribute("href"))).toEqual(["/arcade/binary-challenge/", "/arcade/binary-register/"]);
    expect(container.querySelector('input[type="email"], input[type="password"], input[type="date"], iframe, script')).toBeNull();
    expect(window.localStorage.length).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
