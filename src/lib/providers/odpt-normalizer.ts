import type { DemoScenario, Incident, RailStatus } from "../types";
import type {
  OdptIncidentResolution,
  OdptMockScenario,
  OdptTrainInformationRecord,
} from "./odpt-types";

const railwayIdByOdptRailway: Record<string, string> = {
  "odpt.Railway:Tokyu.Denentoshi": "denentoshi",
  "odpt.Railway:TokyoMetro.Hanzomon": "hanzomon",
  "odpt.Railway:JR-East.Yamanote": "yamanote",
  "odpt.Railway:JR-East.Nambu": "nambu",
  "odpt.Railway:JR-East.Yokosuka": "yokosuka",
};

const statusRules: Array<{
  status: Exclude<RailStatus, "normal">;
  patterns: string[];
}> = [
  { status: "suspended", patterns: ["運転見合わせ", "運休", "suspended"] },
  { status: "reduced", patterns: ["運転本数", "減少", "reduced"] },
  { status: "delayed", patterns: ["遅延", "delay", "delayed"] },
  { status: "unknown", patterns: ["確認中", "unknown", "confirming"] },
];

export function normalizeOdptMockScenarios(
  scenarios: OdptMockScenario[],
  resolutions: Record<string, OdptIncidentResolution>,
): DemoScenario[] {
  return scenarios.map((scenario) => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    incidents: scenario.records
      .map((record) => normalizeOdptTrainInformation(record, resolutions))
      .filter((incident): incident is Incident => Boolean(incident)),
  }));
}

function normalizeOdptTrainInformation(
  record: OdptTrainInformationRecord,
  resolutions: Record<string, OdptIncidentResolution>,
): Incident | undefined {
  const resolution = resolutions[record["owl:sameAs"]];
  const fallbackLineId = railwayIdByOdptRailway[record["odpt:railway"]];

  if (!resolution && !fallbackLineId) {
    return undefined;
  }

  const status = resolution?.status ?? inferStatus(record);
  const scope = resolution?.scope ?? {
    type: "line" as const,
    lineId: fallbackLineId,
  };
  const railwayName =
    record["odpt:railwayTitle"]?.ja ?? record["odpt:railway"].split(".").pop();
  const statusText =
    record["odpt:trainInformationStatus"]?.ja ?? statusLabel(status);
  const rangeText =
    resolution?.affectedArea ??
    record["odpt:trainInformationRange"]?.ja ??
    `${railwayName} 全線`;
  const cause =
    record["odpt:trainInformationCause"]?.ja ??
    record["odpt:trainInformationText"]?.ja ??
    "詳細は確認中です。";

  return {
    id: record["owl:sameAs"].replace(/[^a-zA-Z0-9-]/g, "-"),
    status,
    title: `${railwayName} ${statusText}`,
    reason: record["odpt:trainInformationText"]?.ja ?? cause,
    scope,
    affectedArea: rangeText,
    updatedAt: record["dc:date"],
    note: `ODPT-like mock: ${record["owl:sameAs"]}`,
  };
}

function inferStatus(
  record: OdptTrainInformationRecord,
): Exclude<RailStatus, "normal"> {
  const fields = [
    record["odpt:trainInformationStatus"]?.ja,
    record["odpt:trainInformationStatus"]?.en,
    record["odpt:trainInformationText"]?.ja,
    record["odpt:trainInformationText"]?.en,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const rule of statusRules) {
    if (rule.patterns.some((pattern) => fields.includes(pattern.toLowerCase()))) {
      return rule.status;
    }
  }

  return "unknown";
}

function statusLabel(status: Exclude<RailStatus, "normal">) {
  const labels: Record<Exclude<RailStatus, "normal">, string> = {
    delayed: "遅延",
    suspended: "運転見合わせ",
    reduced: "運転本数減少",
    unknown: "確認中",
  };

  return labels[status];
}
