import type { RailStatus } from "@/lib/types";

/**
 * Stable local id derived from the ODPT railway identifier.
 *
 * We keep ODPT's `owl:sameAs` as the canonical source identifier and only
 * derive this UI id because React keys, URLs, and selections need a compact
 * app-local string.
 */
export function getLineIdFromOdptRailway(odptRailway: string) {
  return odptRailway.replace(/^odpt\.Railway:/, "").replace(/[^a-zA-Z0-9]+/g, "-");
}

export const odptTrainInformationStatusRules: Array<{
  status: Exclude<RailStatus, "normal">;
  patterns: string[];
}> = [
  { status: "suspended", patterns: ["運転見合わせ", "運休", "suspended"] },
  { status: "reduced", patterns: ["運転本数", "減少", "reduced"] },
  { status: "delayed", patterns: ["遅延", "delay", "delayed"] },
  { status: "unknown", patterns: ["確認中", "unknown", "confirming"] },
];
