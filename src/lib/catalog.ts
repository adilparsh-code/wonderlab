export type Difficulty = "Warm-up" | "Steady" | "Stretch";

export type GameDefinition = {
  id: string;
  title: string;
  description: string;
  objective: string;
  category: string;
  ages: string;
  difficulty: Difficulty;
  instructions: string;
  symbol: string;
};

export const games: GameDefinition[] = [
  {
    id: "memory-matrix",
    title: "Memory Matrix",
    description: "Watch a short sequence, then repeat it in the right order.",
    objective: "Practise careful observation and sequential thinking.",
    category: "Focus",
    ages: "11–16",
    difficulty: "Steady",
    instructions:
      "Start a round, watch a sequence of tiles, then select them in order. Each level adds a step.",
    symbol: "01",
  },
  {
    id: "number-quest",
    title: "Number Quest",
    description: "Use multiplication facts to crack a quick number challenge.",
    objective: "Build fluency with multiplication and explain a calculation.",
    category: "Maths",
    ages: "11–14",
    difficulty: "Warm-up",
    instructions:
      "Choose a multiplication level, solve the question, and enter a whole-number answer.",
    symbol: "×",
  },
  {
    id: "logic-maze",
    title: "Logic Maze",
    description: "Plan a route through a grid using a few simple commands.",
    objective: "Practise sequencing, spatial reasoning, and debugging.",
    category: "Logic",
    ages: "11–16",
    difficulty: "Steady",
    instructions:
      "Move from the green start to the star. Dark squares are blocked; use the arrow keys or buttons.",
    symbol: "↗",
  },
  {
    id: "binary-challenge",
    title: "Binary Challenge",
    description: "Translate a decimal number into the computer-friendly base two.",
    objective: "Understand binary place values and number conversion.",
    category: "Coding",
    ages: "12–16",
    difficulty: "Steady",
    instructions:
      "Convert 19 to binary. Use only 0s and 1s; the leftmost digit has the largest place value.",
    symbol: "10",
  },
  {
    id: "pattern-detective",
    title: "Pattern Detective",
    description: "Spot the rule and predict what comes next.",
    objective: "Recognise and describe a repeating mathematical rule.",
    category: "Maths",
    ages: "11–16",
    difficulty: "Steady",
    instructions:
      "Each number is twice the one before it. Enter the next number in the sequence.",
    symbol: "∴",
  },
  {
    id: "typing-sprint",
    title: "Typing Sprint",
    description: "Type a short sentence and check accuracy and speed.",
    objective: "Practise accurate typing and interpret a simple rate.",
    category: "Focus",
    ages: "11–16",
    difficulty: "Warm-up",
    instructions:
      "Type the sentence exactly, then check your accuracy and words per minute. Your text is never saved.",
    symbol: "⌨",
  },
  {
    id: "algorithm-builder",
    title: "Algorithm Builder",
    description: "Put clear instructions in an order that solves a problem.",
    objective: "Explore algorithms as precise, ordered instructions.",
    category: "Coding",
    ages: "11–16",
    difficulty: "Warm-up",
    instructions:
      "Choose each step in order: define a goal, write instructions, then test and improve them.",
    symbol: "{ }",
  },
  {
    id: "reaction-challenge",
    title: "Reaction Challenge",
    description: "Wait for the signal, then tap as soon as it appears.",
    objective: "Measure one response time without making claims about ability.",
    category: "Focus",
    ages: "11–16",
    difficulty: "Warm-up",
    instructions:
      "Start a round and wait for the green signal. Tap too early and you can try again.",
    symbol: "!",
  },
];

export type ScienceDefinition = {
  id: string;
  title: string;
  objective: string;
  intro: string;
  modelNote: string;
};

export const scienceTopics: ScienceDefinition[] = [
  {
    id: "circuits",
    title: "Electric circuits",
    objective: "Trace a complete path from a cell, through a lamp, and back.",
    intro:
      "A lamp lights in this simple model only when the switch closes a complete conducting loop.",
    modelNote:
      "Real circuits have resistance, component limits, and changing voltage. This diagram is a simplified on/off model, not a circuit-design tool.",
  },
  {
    id: "gravity",
    title: "Gravity and falling",
    objective: "Explore how drop height affects an idealised falling time.",
    intro:
      "Near Earth's surface, gravity accelerates falling objects. The model below estimates time using distance = ½ × g × time².",
    modelNote:
      "The estimate uses g = 9.8 m/s² and ignores air resistance, object shape, and changes in gravity with altitude. It is not a real-world prediction.",
  },
  {
    id: "water-cycle",
    title: "The water cycle",
    objective: "Connect evaporation, condensation, precipitation, and collection.",
    intro:
      "Water moves through connected stages, powered largely by energy from the Sun and shaped by gravity.",
    modelNote:
      "The cycle is simplified: real water can follow many paths, pause in stores, and change phase under different conditions.",
  },
  {
    id: "simple-machines",
    title: "Levers and simple machines",
    objective: "Compare the effort force for different lever-arm lengths.",
    intro:
      "A longer effort arm can reduce the force needed to balance a load, while the effort point travels farther.",
    modelNote:
      "The ideal calculation ignores friction, the lever's own weight, and structural limits. Simple machines trade force for distance; they do not create energy.",
  },
  {
    id: "solar-system",
    title: "The solar system",
    objective: "Compare orbital periods in a deliberately simplified diagram.",
    intro:
      "Planets travel around the Sun on different orbits. In general, planets farther away take longer to complete one orbit.",
    modelNote:
      "This illustration is not to scale in distance, size, or orbital speed. Planet paths are ellipses, not perfect circles.",
  },
  {
    id: "binary-computer",
    title: "How computers use binary",
    objective: "Read the place values that make up a binary number.",
    intro:
      "Each binary digit is a bit. Starting from the right, place values double: 1, 2, 4, 8, and so on.",
    modelNote:
      "This shows one small unsigned whole number. Real computers use many bits and different rules for signed numbers, text, images, and other data.",
  },
];

export function validateCatalog(items: GameDefinition[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const required: (keyof GameDefinition)[] = [
    "id",
    "title",
    "description",
    "objective",
    "category",
    "ages",
    "difficulty",
    "instructions",
    "symbol",
  ];

  for (const item of items) {
    if (ids.has(item.id)) errors.push(`Duplicate game id: ${item.id}`);
    ids.add(item.id);
    for (const field of required) {
      if (!item[field].trim()) {
        errors.push(`Missing ${field} for game ${item.id || "(unknown)"}`);
      }
    }
  }

  return errors;
}
