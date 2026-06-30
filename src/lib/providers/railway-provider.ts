import type { DemoScenario, RailwaySnapshot } from "../types";

export type RailwayProvider = {
  id: string;
  label: string;
  getScenarioList: () => DemoScenario[];
  getRailwaySnapshot: (scenarioId: string) => RailwaySnapshot;
};
