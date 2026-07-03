import { mockRailwayProvider } from "./providers/mock-railway-provider";
import { odptImportProvider } from "./providers/odpt-import-provider";
import type { RailwayProvider } from "./providers/railway-provider";
import type { DemoScenario, RailwaySnapshot } from "./types";

const providers: RailwayProvider[] = [odptImportProvider, mockRailwayProvider];

export function getScenarioList(): DemoScenario[] {
  return providers.flatMap((provider) => provider.getScenarioList());
}

export function getRailwaySnapshot(scenarioId: string): RailwaySnapshot {
  const provider = providers.find((item) =>
    item.getScenarioList().some((scenario) => scenario.id === scenarioId),
  );

  if (!provider) {
    return mockRailwayProvider.getRailwaySnapshot(
      mockRailwayProvider.getScenarioList()[0].id,
    );
  }

  return provider.getRailwaySnapshot(scenarioId);
}

export function getRailwaySnapshotsByScenario() {
  return Object.fromEntries(
    getScenarioList().map((scenario) => [
      scenario.id,
      getRailwaySnapshot(scenario.id),
    ]),
  );
}

export function getActiveProvider() {
  return {
    id: providers.map((provider) => provider.id).join("+"),
    label: providers.map((provider) => provider.label).join(" + "),
  };
}
