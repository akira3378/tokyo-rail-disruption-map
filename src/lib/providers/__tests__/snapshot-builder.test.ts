import { describe, expect, it } from "vitest";
import { buildRailwaySnapshot } from "../snapshot-builder";
import type { Incident, OperationSnapshot, RailLine } from "@/lib/types";

const line: RailLine = {
  id: "Keio-Keio",
  name: "京王線",
  operator: "Keio",
  color: "#dd0077",
  stationIds: ["Shinjuku", "Sasazuka", "Meidaimae", "Chofu"],
};

function operation(incidents: Incident[]): OperationSnapshot {
  return {
    id: "test-operation",
    name: "Test operation",
    description: "Test operation snapshot",
    incidents,
  };
}

describe("buildRailwaySnapshot", () => {
  it("applies segment incidents only to the affected section", () => {
    const snapshot = buildRailwaySnapshot(
      operation([
        {
          id: "incident-1",
          status: "delayed",
          title: "京王線 遅延",
          reason: "安全確認",
          scope: {
            type: "segment",
            lineId: "Keio-Keio",
            fromStationId: "Sasazuka",
            toStationId: "Chofu",
          },
          affectedArea: "笹塚〜調布",
          updatedAt: "2026-07-07T08:00:00+09:00",
        },
      ]),
      {
        stations: [],
        lines: [line],
        segments: [
          {
            id: "Shinjuku-Sasazuka",
            lineId: "Keio-Keio",
            fromStationId: "Shinjuku",
            toStationId: "Sasazuka",
          },
          {
            id: "Sasazuka-Meidaimae",
            lineId: "Keio-Keio",
            fromStationId: "Sasazuka",
            toStationId: "Meidaimae",
          },
          {
            id: "Meidaimae-Chofu",
            lineId: "Keio-Keio",
            fromStationId: "Meidaimae",
            toStationId: "Chofu",
          },
        ],
      },
    );

    expect(snapshot.lines[0].status).toBe("delayed");
    expect(snapshot.lines[0].segments.map((segment) => segment.status)).toEqual(
      ["normal", "delayed", "delayed"],
    );
  });

  it("keeps incidents for lines that are not in the railway network yet", () => {
    const snapshot = buildRailwaySnapshot(
      operation([
        {
          id: "incident-2",
          status: "unknown",
          title: "外部路線 確認中",
          lineName: "外部路線",
          operatorName: "Unknown operator",
          reason: "詳細確認中",
          scope: {
            type: "line",
            lineId: "External-Line",
          },
          affectedArea: "外部路線 全線",
          updatedAt: "2026-07-07T08:00:00+09:00",
        },
      ]),
      {
        stations: [],
        lines: [line],
        segments: [],
      },
    );

    expect(snapshot.lines.map((item) => item.id)).toEqual([
      "Keio-Keio",
      "External-Line",
    ]);
    expect(snapshot.lines[1]).toMatchObject({
      name: "外部路線",
      operator: "Unknown operator",
      status: "unknown",
    });
  });
});
