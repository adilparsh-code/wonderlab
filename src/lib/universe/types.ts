export type UniverseFamily = "space" | "science" | "coding" | "maths" | "strategy";
export type UniverseGameSpec = {
  id: string;
  title: string;
  description: string;
  objective: string;
  instructions: string;
  takeaway: string;
  category: string;
  ages: string;
  difficulty: "Warm-up" | "Steady" | "Stretch";
  symbol: string;
  engine: UniverseFamily;
  mechanic: string;
};
export type RoundResult = { correct: boolean; message: string };
export type BoardProps = {
  gameId: string;
  round: number;
  disabled: boolean;
  onResult: (result: RoundResult) => void;
};
