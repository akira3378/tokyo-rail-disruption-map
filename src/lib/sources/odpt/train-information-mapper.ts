import type {
  Incident,
  IncidentScope,
  OperationSnapshot,
  RailStatus,
} from "@/lib/types";
import {
  getLineIdFromOdptRailway,
  odptTrainInformationStatusRules,
} from "./railway-mapping";
import type { OdptTrainInformationRecord } from "./types";

export type OdptIncidentResolution = {
  status: Exclude<RailStatus, "normal">;
  scope: IncidentScope;
  affectedArea: string;
};

export function mapOdptTrainInformationToOperationSnapshot(
  records: OdptTrainInformationRecord[],
  options: {
    id: string;
    name: string;
    description: string;
    resolutions?: Record<string, OdptIncidentResolution>;
  },
): OperationSnapshot {
  const resolutions = options.resolutions ?? {};

  return {
    id: options.id,
    name: options.name,
    description: options.description,
    incidents: records
      .map((record) => mapOdptTrainInformationRecord(record, resolutions))
      .filter((incident): incident is Incident => Boolean(incident)),
  };
}

function mapOdptTrainInformationRecord(
  record: OdptTrainInformationRecord,
  resolutions: Record<string, OdptIncidentResolution>,
): Incident | undefined {
  const resolution = resolutions[record["owl:sameAs"]];
  const fallbackLineId = getLineIdFromOdptRailway(record["odpt:railway"]);

  const inferredStatus = inferTrainInformationStatus(record);

  if (!resolution && inferredStatus === "normal") {
    return undefined;
  }

  const status = resolution?.status ?? inferredStatus;
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
    scope: resolution?.scope ?? {
      type: "line",
      lineId: fallbackLineId,
    },
    affectedArea: rangeText,
    updatedAt: record["dc:date"],
    note: `ODPT TrainInformation: ${record["owl:sameAs"]}`,
    source: {
      provider: "odpt",
      resourceType: "odpt:TrainInformation",
      raw: record,
    },
  };
}

function inferTrainInformationStatus(record: OdptTrainInformationRecord): RailStatus {
  const fields = [
    record["odpt:trainInformationStatus"]?.ja,
    record["odpt:trainInformationStatus"]?.en,
    record["odpt:trainInformationText"]?.ja,
    record["odpt:trainInformationText"]?.en,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (isNormalOperationText(fields)) {
    return "normal";
  }

  for (const rule of odptTrainInformationStatusRules) {
    if (rule.patterns.some((pattern) => fields.includes(pattern.toLowerCase()))) {
      return rule.status;
    }
  }

  return "unknown";
}

function isNormalOperationText(fields: string) {
  return [
    "平常どおり",
    "平常通り",
    "平常運行",
    "通常通り",
    "遅延はありません",
    "delay-free",
    "normal",
  ].some((pattern) => fields.includes(pattern.toLowerCase()));
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
