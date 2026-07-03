import type { RailLine, Segment, Station } from "@/lib/types";
import { getLineIdFromOdptRailway } from "./railway-mapping";
import type { OdptRailwayRecord } from "./types";

const fallbackPalette = [
  "#1f77b4",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#17becf",
  "#bcbd22",
];

export type OdptRailwayNetwork = {
  stations: Station[];
  lines: RailLine[];
  segments: Segment[];
};

export function mapOdptRailwaysToNetwork(
  railways: OdptRailwayRecord[],
): OdptRailwayNetwork {
  const lines = railways
    .map((railway, index) => mapOdptRailwayToLine(railway, index))
    .sort((a, b) => a.operator.localeCompare(b.operator) || a.name.localeCompare(b.name));

  return {
    stations: [],
    lines,
    segments: [],
  };
}

function mapOdptRailwayToLine(
  railway: OdptRailwayRecord,
  index: number,
): RailLine {
  const sameAs = railway["owl:sameAs"];

  return {
    id: getLineIdFromOdptRailway(sameAs),
    name: railway["odpt:railwayTitle"]?.ja ?? railway["dc:title"] ?? sameAs,
    nameEn: railway["odpt:railwayTitle"]?.en,
    operator: formatOperatorName(railway["odpt:operator"]),
    color: normalizeRailwayColor(railway["odpt:color"], index),
    stationIds: [],
    source: {
      provider: "odpt",
      resourceType: "odpt:Railway",
      raw: railway,
    },
  };
}

function formatOperatorName(operator: string) {
  return operator.replace(/^odpt\.Operator:/, "");
}

function normalizeRailwayColor(color: string | undefined, index: number) {
  if (color?.startsWith("#")) {
    return color;
  }

  return fallbackPalette[index % fallbackPalette.length];
}
