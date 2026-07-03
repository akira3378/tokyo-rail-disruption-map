import { buildRailwaySnapshot } from "./providers/snapshot-builder";
import type { OperationSnapshot, RailwaySnapshot } from "./types";

const loadingScenario: OperationSnapshot = {
  id: "odpt-loading-snapshot",
  name: "Loading ODPT live data",
  description:
    "The browser is loading the latest TrainInformation snapshot from the server API.",
  incidents: [],
};

export function getInitialRailwaySnapshot(): RailwaySnapshot {
  return buildRailwaySnapshot(loadingScenario, {
    stations: [],
    lines: [],
    segments: [],
  });
}

export function getActiveProvider() {
  return {
    id: "odpt-live-api",
    label: "ODPT TrainInformation server API",
  };
}
