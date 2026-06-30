import { mockRailwayProvider } from "./providers/mock-railway-provider";
import type { RailwayProvider } from "./providers/railway-provider";
import type { DemoScenario, RailwaySnapshot } from "./types";

const activeProvider: RailwayProvider = mockRailwayProvider;

export function getScenarioList(): DemoScenario[] {
  return activeProvider.getScenarioList();
}

export function getRailwaySnapshot(scenarioId: string): RailwaySnapshot {
  return activeProvider.getRailwaySnapshot(scenarioId);
}

export function getActiveProvider() {
  return {
    id: activeProvider.id,
    label: activeProvider.label,
  };
}
