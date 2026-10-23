"use client";

import { useState } from "react";
import { scienceTopics } from "@/lib/catalog";
import { decimalToBinary } from "@/lib/game-logic";

type CheckProps = {
  question: string;
  options: [string, string];
  correct: number;
  explanation: string;
};

function KnowledgeCheck({ question, options, correct, explanation }: CheckProps) {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <div className="knowledge-check">
      <p>
        <strong>Quick check:</strong> {question}
      </p>
      <div className="button-row">
        {options.map((option, index) => (
          <button
            aria-pressed={answer === index}
            className="button button--quiet button--small"
            key={option}
            onClick={() => setAnswer(index)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
      {answer !== null && (
        <p className="status-message" data-kind={answer === correct ? "success" : "error"}>
          {answer === correct ? "That’s right. " : "Not quite. "}
          {explanation}
        </p>
      )}
    </div>
  );
}

function Slider({
  id,
  label,
  min,
  max,
  value,
  onChange,
  unit,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit: string;
}) {
  return (
    <label className="inline-control" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={Number.isInteger(min) ? 1 : 0.1}
        type="range"
        value={value}
      />
      <strong>
        {value} {unit}
      </strong>
    </label>
  );
}

export function ScienceExperiences() {
  const [circuitClosed, setCircuitClosed] = useState(false);
  const [height, setHeight] = useState(20);
  const [waterStage, setWaterStage] = useState(0);
  const [effortArm, setEffortArm] = useState(1.5);
  const [orbitPlanet, setOrbitPlanet] = useState<"Mercury" | "Earth" | "Neptune">(
    "Earth",
  );
  const [binaryValue, setBinaryValue] = useState(10);

  const gravityTime = Math.sqrt((2 * height) / 9.8);
  const idealEffort = Math.round((80 * 1) / effortArm);
  const selectedPlanet = {
    Mercury: { period: "88 days", orbit: "mercury" },
    Earth: { period: "365 days", orbit: "earth" },
    Neptune: { period: "about 165 years", orbit: "neptune" },
  }[orbitPlanet];
  const waterStages = [
    {
      name: "Evaporation",
      text: "Energy warms liquid water. Some molecules gain enough energy to become water vapour.",
      symbol: "☀ → ↑",
    },
    {
      name: "Condensation",
      text: "As moist air cools, water vapour can condense into tiny liquid droplets in clouds.",
      symbol: "↑ → ☁",
    },
    {
      name: "Precipitation",
      text: "Water droplets or ice crystals can grow and fall as rain, snow, sleet, or hail.",
      symbol: "☁ → ↓",
    },
    {
      name: "Collection",
      text: "Water gathers in rivers, lakes, oceans, soil, and ice; some flows or seeps onwards.",
      symbol: "↓ → ≋",
    },
  ];

  return (
    <div className="science-grid">
      {scienceTopics.map((topic) => (
        <article className="science-card" id={topic.id} key={topic.id}>
          <p className="eyebrow">{topic.objective}</p>
          <h2>{topic.title}</h2>
          <p>{topic.intro}</p>

          {topic.id === "circuits" && (
            <>
              <div className={`diagram${circuitClosed ? "" : " diagram--dark"}`} aria-live="polite">
                Cell ── switch {circuitClosed ? "●" : "○"} ── lamp{" "}
                {circuitClosed ? "✦" : "·"} ── return
              </div>
              <button
                aria-pressed={circuitClosed}
                className="button button--bright"
                onClick={() => setCircuitClosed((current) => !current)}
                type="button"
              >
                {circuitClosed ? "Open the switch" : "Close the switch"}
              </button>
              <p role="status">
                {circuitClosed
                  ? "A complete loop is shown, so the lamp is on in this model."
                  : "The path is broken, so the lamp is off in this model."}
              </p>
              <KnowledgeCheck
                correct={0}
                explanation="A complete conducting loop lets current flow through the lamp and back to the cell."
                options={["A complete loop", "A bigger drawing"]}
                question="What does this simple circuit need to light the lamp?"
              />
            </>
          )}

          {topic.id === "gravity" && (
            <>
              <Slider
                id="drop-height"
                label="Drop height"
                max={50}
                min={5}
                onChange={setHeight}
                unit="m"
                value={height}
              />
              <div className="diagram" aria-live="polite">
                {height} m → about {gravityTime.toFixed(2)} s
              </div>
              <p>
                Ideal estimate: t = √(2h / g), using g = 9.8 m/s². More height
                means more time to fall in this simplified model.
              </p>
              <KnowledgeCheck
                correct={0}
                explanation="A larger drop distance gives a longer ideal fall time; mass is not in this no-air-resistance equation."
                options={["A greater drop height", "A heavier object"]}
                question="In this model, what changes the estimated fall time?"
              />
            </>
          )}

          {topic.id === "water-cycle" && (
            <>
              <Slider
                id="water-stage"
                label="Cycle stage"
                max={3}
                min={0}
                onChange={setWaterStage}
                unit={`of ${waterStages.length - 1}`}
                value={waterStage}
              />
              <div className="diagram" aria-live="polite">
                {waterStages[waterStage].symbol} &nbsp; {waterStages[waterStage].name}
              </div>
              <p>{waterStages[waterStage].text}</p>
              <KnowledgeCheck
                correct={0}
                explanation="Evaporation changes liquid water into water vapour."
                options={["Evaporation", "Precipitation"]}
                question="Which process turns liquid water into vapour?"
              />
            </>
          )}

          {topic.id === "simple-machines" && (
            <>
              <Slider
                id="effort-arm"
                label="Effort arm"
                max={2}
                min={0.5}
                onChange={setEffortArm}
                unit="m"
                value={effortArm}
              />
              <div className="diagram" aria-live="polite">
                80 N load × 1 m ÷ {effortArm.toFixed(1)} m effort arm = about{" "}
                {idealEffort} N effort
              </div>
              <p>
                For an ideal balanced lever, load × load arm = effort × effort
                arm. Moving the effort farther from the pivot can reduce the
                required force.
              </p>
              <KnowledgeCheck
                correct={0}
                explanation="The lower force comes with a greater effort distance; no energy is created."
                options={["Force for distance", "Energy from nowhere"]}
                question="What does an ideal lever trade?"
              />
            </>
          )}

          {topic.id === "solar-system" && (
            <>
              <label className="field">
                Choose a planet
                <select
                  onChange={(event) => {
                    const value = event.target.value;
                    if (
                      value === "Mercury" ||
                      value === "Earth" ||
                      value === "Neptune"
                    ) {
                      setOrbitPlanet(value);
                    }
                  }}
                  value={orbitPlanet}
                >
                  <option>Mercury</option>
                  <option>Earth</option>
                  <option>Neptune</option>
                </select>
              </label>
              <div className="diagram" aria-live="polite">
                <div
                  aria-label={`${orbitPlanet} orbit illustration`}
                  className={`orbit-diagram orbit-diagram--${selectedPlanet.orbit}`}
                >
                  <span className="orbit-ring orbit-ring--one" />
                  <span className="orbit-ring orbit-ring--two" />
                  <span className="orbit-ring orbit-ring--three" />
                  <span className="orbit-sun" aria-hidden="true" />
                  <span className="orbit-planet" aria-hidden="true" />
                </div>
                <br />
                {orbitPlanet}: {selectedPlanet.period}
              </div>
              <p>
                A year is one orbit around the Sun. More distant planets generally
                have longer orbital periods.
              </p>
              <KnowledgeCheck
                correct={1}
                explanation="Neptune takes about 165 Earth years to orbit the Sun once."
                options={["Mercury", "Neptune"]}
                question="Which of these planets has the longer year?"
              />
            </>
          )}

          {topic.id === "binary-computer" && (
            <>
              <Slider
                id="binary-number"
                label="Decimal value"
                max={15}
                min={0}
                onChange={setBinaryValue}
                unit=""
                value={binaryValue}
              />
              <div className="diagram" aria-live="polite">
                {decimalToBinary(binaryValue).padStart(4, "0")}₂ = {binaryValue}₁₀
                <br />
                8 · 4 · 2 · 1 place values
              </div>
              <p>
                A 1 means include that place value; a 0 means leave it out. For
                example, 1010₂ = 8 + 2 = 10₁₀.
              </p>
              <KnowledgeCheck
                correct={0}
                explanation="1010₂ is 8 + 0 + 2 + 0, which equals decimal 10."
                options={["10", "5"]}
                question="What is 1010₂ in decimal?"
              />
            </>
          )}

          <p className="game-score">
            <strong>Model limitation:</strong> {topic.modelNote}
          </p>
        </article>
      ))}
    </div>
  );
}
