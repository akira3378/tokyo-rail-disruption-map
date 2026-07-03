import type { RailStatus } from "@/lib/types";

/**
 * Bridge ODPT railway identifiers to this app's current schematic network.
 *
 * The source data already contains many more railways than the first map view.
 * Keep this mapping explicit so adding more Tokyo-area lines is a data change,
 * not a UI rewrite.
 */
export const lineIdByOdptRailway: Record<string, string> = {
  "odpt.Railway:Tokyu.Denentoshi": "denentoshi",
  "odpt.Railway:TokyoMetro.Hanzomon": "hanzomon",
  "odpt.Railway:JR-East.Yamanote": "yamanote",
  "odpt.Railway:JR-East.Nambu": "nambu",
  "odpt.Railway:JR-East.Yokosuka": "yokosuka",
};

export const odptTrainInformationStatusRules: Array<{
  status: Exclude<RailStatus, "normal">;
  patterns: string[];
}> = [
  { status: "suspended", patterns: ["運転見合わせ", "運休", "suspended"] },
  { status: "reduced", patterns: ["運転本数", "減少", "reduced"] },
  { status: "delayed", patterns: ["遅延", "delay", "delayed"] },
  { status: "unknown", patterns: ["確認中", "unknown", "confirming"] },
];
