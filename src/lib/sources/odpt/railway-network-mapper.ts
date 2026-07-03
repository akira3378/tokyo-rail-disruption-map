import type { RailLine, Segment, Station } from "@/lib/types";
import {
  getLineIdFromOdptRailway,
  railwayColorOverrides,
} from "./railway-mapping";
import type { OdptRailwayRecord } from "./types";

const fallbackPalette = [
  "#006BA6",
  "#2A9D8F",
  "#E76F51",
  "#6A4C93",
  "#B56576",
  "#3A86FF",
  "#7CB518",
  "#D95D39",
];

export type OdptRailwayNetwork = {
  stations: Station[];
  lines: RailLine[];
  segments: Segment[];
};

export function mapOdptRailwaysToNetwork(
  railways: OdptRailwayRecord[],
): OdptRailwayNetwork {
  return {
    stations: [],
    lines: railways
      .map((railway, index) => mapOdptRailwayToLine(railway, index))
      .sort(
        (a, b) =>
          a.operator.localeCompare(b.operator) || a.name.localeCompare(b.name),
      ),
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
    color: normalizeRailwayColor(railway, index),
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

function normalizeRailwayColor(railway: OdptRailwayRecord, index: number) {
  const color = railway["odpt:color"];

  if (color?.startsWith("#")) {
    return color;
  }

  const override = railwayColorOverrides[railway["owl:sameAs"]];

  if (override) {
    return override;
  }

  return fallbackPalette[index % fallbackPalette.length];
}
