import type { ComponentType } from "react";
import type { BoardProps, UniverseFamily } from "@/lib/universe/types";

// Cache successful modules through the bundler, not rejected React.lazy promises.
// Calling a loader again lets the runtime retry a failed chunk download.
const loaders = {
  space: () => import("./space").then(module => module.SpaceBoard),
  science: () => import("./science").then(module => module.ScienceBoard),
  coding: () => import("./coding").then(module => module.CodingBoard),
  maths: () => import("./maths").then(module => module.MathsBoard),
  strategy: () => import("./strategy").then(module => module.StrategyBoard),
};

export function loadUniverseBoard(family: UniverseFamily): Promise<ComponentType<BoardProps>> {
  return loaders[family]();
}
