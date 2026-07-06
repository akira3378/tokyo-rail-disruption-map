import { describe, expect, it } from "vitest";
import { mapOdptRailwaysToNetwork } from "../railway-network-mapper";
import type { OdptRailwayRecord } from "../types";

function railwayRecord(
  overrides: Partial<OdptRailwayRecord>,
): OdptRailwayRecord {
  return {
    "@context": "https://vocab.odpt.org/context_odpt.jsonld",
    "@id": "urn:uuid:test-railway",
    "@type": "odpt:Railway",
    "owl:sameAs": "odpt.Railway:JR-East.Yamanote",
    "odpt:operator": "odpt.Operator:JR-East",
    "dc:title": "Yamanote Line",
    "odpt:railwayTitle": {
      ja: "山手線",
      en: "Yamanote Line",
    },
    ...overrides,
  };
}

describe("mapOdptRailwaysToNetwork", () => {
  it("maps ODPT railway records into app line models", () => {
    const network = mapOdptRailwaysToNetwork([
      railwayRecord({
        "odpt:color": "#9ACD32",
      }),
    ]);

    expect(network.stations).toEqual([]);
    expect(network.segments).toEqual([]);
    expect(network.lines[0]).toMatchObject({
      id: "JR-East-Yamanote",
      name: "山手線",
      nameEn: "Yamanote Line",
      operator: "JR-East",
      color: "#9ACD32",
      stationIds: [],
      source: {
        provider: "odpt",
        resourceType: "odpt:Railway",
      },
    });
  });

  it("sorts lines by operator and Japanese line name for stable UI output", () => {
    const network = mapOdptRailwaysToNetwork([
      railwayRecord({
        "owl:sameAs": "odpt.Railway:Tokyu.Toyoko",
        "odpt:operator": "odpt.Operator:Tokyu",
        "odpt:railwayTitle": {
          ja: "東横線",
        },
      }),
      railwayRecord({
        "owl:sameAs": "odpt.Railway:JR-East.ChuoRapid",
        "odpt:operator": "odpt.Operator:JR-East",
        "odpt:railwayTitle": {
          ja: "中央線快速",
        },
      }),
    ]);

    expect(network.lines.map((line) => line.id)).toEqual([
      "JR-East-ChuoRapid",
      "Tokyu-Toyoko",
    ]);
  });
});
