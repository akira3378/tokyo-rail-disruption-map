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

export const railwayColorOverrides: Record<string, string> = {
  "odpt.Railway:JR-East.ChuoRapid": "#F15A24",
  "odpt.Railway:JR-East.ChuoSobuLocal": "#FFD400",
  "odpt.Railway:JR-East.JobanLocal": "#00B261",
  "odpt.Railway:JR-East.JobanRapid": "#00B261",
  "odpt.Railway:JR-East.KeihinTohokuNegishi": "#00B2E5",
  "odpt.Railway:JR-East.Keiyo": "#C9242F",
  "odpt.Railway:JR-East.Musashino": "#F58220",
  "odpt.Railway:JR-East.Nambu": "#FFD400",
  "odpt.Railway:JR-East.Ome": "#F15A24",
  "odpt.Railway:JR-East.SaikyoKawagoe": "#00A85A",
  "odpt.Railway:JR-East.ShonanShinjuku": "#E21F26",
  "odpt.Railway:JR-East.SobuRapid": "#007AC0",
  "odpt.Railway:JR-East.Takasaki": "#F68B1F",
  "odpt.Railway:JR-East.Tokaido": "#F68B1F",
  "odpt.Railway:JR-East.Utsunomiya": "#F68B1F",
  "odpt.Railway:JR-East.Yamanote": "#9ACD32",
  "odpt.Railway:JR-East.Yokohama": "#80C241",
  "odpt.Railway:JR-East.Yokosuka": "#007AC0",
  "odpt.Railway:Keikyu.Main": "#00A3E0",
  "odpt.Railway:Keikyu.Airport": "#00A3E0",
  "odpt.Railway:Keikyu.Kurihama": "#00A3E0",
  "odpt.Railway:Keikyu.Zushi": "#00A3E0",
  "odpt.Railway:Keio.Inokashira": "#0E8BCB",
  "odpt.Railway:Keio.Keio": "#DD0077",
  "odpt.Railway:Keio.KeioNew": "#DD0077",
  "odpt.Railway:Keio.Sagamihara": "#DD0077",
  "odpt.Railway:Keio.Takao": "#DD0077",
  "odpt.Railway:Keisei.Main": "#005AAA",
  "odpt.Railway:Keisei.NaritaSkyAccess": "#F7931D",
  "odpt.Railway:Keisei.Oshiage": "#005AAA",
  "odpt.Railway:Odakyu.Enoshima": "#2288CC",
  "odpt.Railway:Odakyu.Odawara": "#2288CC",
  "odpt.Railway:Odakyu.Tama": "#2288CC",
  "odpt.Railway:Seibu.Ikebukuro": "#EF7A00",
  "odpt.Railway:Seibu.SeibuChichibu": "#EF7A00",
  "odpt.Railway:Seibu.SeibuYurakucho": "#EF7A00",
  "odpt.Railway:Seibu.Shinjuku": "#00A6BF",
  "odpt.Railway:Sotetsu.Izumino": "#004EA2",
  "odpt.Railway:Sotetsu.Main": "#004EA2",
  "odpt.Railway:Sotetsu.SotetsuShinYokohama": "#004EA2",
  "odpt.Railway:Tobu.Tojo": "#004098",
  "odpt.Railway:Tobu.TobuSkytree": "#0F6CC3",
  "odpt.Railway:Tobu.TobuSkytreeBranch": "#0F6CC3",
  "odpt.Railway:Tobu.TobuUrbanPark": "#33A23D",
  "odpt.Railway:Tokyu.DenEnToshi": "#20A288",
  "odpt.Railway:Tokyu.Ikegami": "#EE86A7",
  "odpt.Railway:Tokyu.Meguro": "#009CD3",
  "odpt.Railway:Tokyu.Oimachi": "#F18C43",
  "odpt.Railway:Tokyu.TokyuShinYokohama": "#8A1184",
  "odpt.Railway:Tokyu.Toyoko": "#DA0442",
  "odpt.Railway:Toei.Arakawa": "#40B3A2",
  "odpt.Railway:Toei.NipporiToneri": "#00A6D6",
  "odpt.Railway:TokyoMonorail.HanedaAirport": "#1479BE",
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
