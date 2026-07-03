import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DemoScenario, RailwaySnapshot } from "../types";
import { normalizeOdptTrainInformationRecords } from "./odpt-normalizer";
import type { OdptTrainInformationRecord } from "./odpt-types";
import type { RailwayProvider } from "./railway-provider";
import { buildRailwaySnapshot } from "./snapshot-builder";

const trainInformationPath = join(
  process.cwd(),
  "data/odpt/raw/train-information.json",
);
const manifestPath = join(process.cwd(), "data/odpt/manifest.json");

export const odptImportProvider: RailwayProvider = {
  id: "odpt-import",
  label: "ODPT TrainInformation",
  getScenarioList,
  getRailwaySnapshot,
};

let cachedScenario: DemoScenario | undefined;

function getScenarioList(): DemoScenario[] {
  const scenario = readImportedScenario();

  return scenario ? [scenario] : [];
}

function getRailwaySnapshot(scenarioId: string): RailwaySnapshot {
  const scenario = readImportedScenario();

  if (!scenario || scenario.id !== scenarioId) {
    throw new Error(`ODPT scenario is not available: ${scenarioId}`);
  }

  return buildRailwaySnapshot(scenario);
}

function readImportedScenario() {
  if (cachedScenario) {
    return cachedScenario;
  }

  const records = readJson<OdptTrainInformationRecord[]>(trainInformationPath);

  if (!records || records.length === 0) {
    return undefined;
  }

  const manifest = readJson<{ fetchedAt?: string }>(manifestPath);
  const fetchedAt = manifest?.fetchedAt
    ? new Date(manifest.fetchedAt)
    : undefined;
  const fetchedLabel = fetchedAt
    ? new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Asia/Tokyo",
      }).format(fetchedAt)
    : "local cache";

  cachedScenario = normalizeOdptTrainInformationRecords(records, {
    id: "odpt-current-snapshot",
    name: "ODPT current snapshot",
    description: `ODPT TrainInformation cache fetched at ${fetchedLabel}.`,
  });

  return cachedScenario;
}

function readJson<T>(filePath: string): T | undefined {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return undefined;
  }
}
