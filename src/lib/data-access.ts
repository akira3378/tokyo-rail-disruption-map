import { odptImportProvider } from "./providers/odpt-import-provider";
import type { RailwayProvider } from "./providers/railway-provider";
import { buildRailwaySnapshot } from "./providers/snapshot-builder";
import type { DemoScenario, RailwaySnapshot } from "./types";

const offlineScenario: DemoScenario = {
  id: "odpt-offline-snapshot",
  name: "ODPT data not loaded",
  description:
    "No local ODPT TrainInformation cache is available. Run npm run import:odpt to load the latest official data.",
  incidents: [],
};

const offlineProvider: RailwayProvider = {
  id: "odpt-offline",
  label: "ODPT offline fallback",
  getScenarioList: () => [offlineScenario],
  getRailwaySnapshot: () => buildRailwaySnapshot(offlineScenario),
};

function getProviders(): RailwayProvider[] {
  const odptScenarios = odptImportProvider.getScenarioList();

  return odptScenarios.length > 0 ? [odptImportProvider] : [offlineProvider];
}

export function getScenarioList(): DemoScenario[] {
  return getProviders().flatMap((provider) => provider.getScenarioList());
}

export function getRailwaySnapshot(scenarioId: string): RailwaySnapshot {
  const providers = getProviders();
  const provider = providers.find((item) =>
    item.getScenarioList().some((scenario) => scenario.id === scenarioId),
  );

  if (!provider) {
    return providers[0].getRailwaySnapshot(providers[0].getScenarioList()[0].id);
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
  const providers = getProviders();

  return {
    id: providers.map((provider) => provider.id).join("+"),
    label: providers.map((provider) => provider.label).join(" + "),
  };
}
