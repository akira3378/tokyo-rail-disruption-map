import { describe, expect, it } from "vitest";
import { mapOdptTrainInformationToOperationSnapshot } from "../train-information-mapper";
import type { OdptTrainInformationRecord } from "../types";

function trainInformationRecord(
  overrides: Partial<OdptTrainInformationRecord>,
): OdptTrainInformationRecord {
  return {
    "@context": "https://vocab.odpt.org/context_odpt.jsonld",
    "@id": "urn:uuid:test-train-information",
    "@type": "odpt:TrainInformation",
    "owl:sameAs": "odpt.TrainInformation:JR-East.Yamanote",
    "dc:date": "2026-07-07T08:00:00+09:00",
    "odpt:operator": "odpt.Operator:JR-East",
    "odpt:railway": "odpt.Railway:JR-East.Yamanote",
    "odpt:railwayTitle": {
      ja: "山手線",
      en: "Yamanote Line",
    },
    ...overrides,
  };
}

describe("mapOdptTrainInformationToOperationSnapshot", () => {
  it("drops normal operation records from the incident list", () => {
    const snapshot = mapOdptTrainInformationToOperationSnapshot(
      [
        trainInformationRecord({
          "odpt:trainInformationText": {
            ja: "現在、平常どおり運転しています。",
          },
        }),
      ],
      {
        id: "test-snapshot",
        name: "Test snapshot",
        description: "Test description",
      },
    );

    expect(snapshot.incidents).toEqual([]);
  });

  it("maps delayed ODPT records into app incidents with source metadata", () => {
    const snapshot = mapOdptTrainInformationToOperationSnapshot(
      [
        trainInformationRecord({
          "odpt:trainInformationStatus": {
            ja: "遅延",
            en: "Delayed",
          },
          "odpt:trainInformationRange": {
            ja: "山手線 全線",
          },
          "odpt:trainInformationText": {
            ja: "安全確認の影響で、一部列車に遅れが出ています。",
          },
        }),
      ],
      {
        id: "test-snapshot",
        name: "Test snapshot",
        description: "Test description",
      },
    );

    expect(snapshot.incidents).toHaveLength(1);
    expect(snapshot.incidents[0]).toMatchObject({
      id: "odpt-TrainInformation-JR-East-Yamanote",
      status: "delayed",
      title: "山手線 遅延",
      affectedArea: "山手線 全線",
      reason: "安全確認の影響で、一部列車に遅れが出ています。",
      scope: {
        type: "line",
        lineId: "JR-East-Yamanote",
      },
      source: {
        provider: "odpt",
        resourceType: "odpt:TrainInformation",
      },
    });
  });

  it("uses explicit incident resolutions when provider text is not enough", () => {
    const snapshot = mapOdptTrainInformationToOperationSnapshot(
      [
        trainInformationRecord({
          "owl:sameAs": "odpt.TrainInformation:Keio.Keio",
          "odpt:railway": "odpt.Railway:Keio.Keio",
          "odpt:railwayTitle": {
            ja: "京王線",
            en: "Keio Line",
          },
          "odpt:trainInformationText": {
            ja: "詳細は確認中です。",
          },
        }),
      ],
      {
        id: "test-snapshot",
        name: "Test snapshot",
        description: "Test description",
        resolutions: {
          "odpt.TrainInformation:Keio.Keio": {
            status: "suspended",
            affectedArea: "新宿〜明大前",
            scope: {
              type: "segment",
              lineId: "Keio-Keio",
              fromStationId: "Keio.Shinjuku",
              toStationId: "Keio.Meidaimae",
            },
          },
        },
      },
    );

    expect(snapshot.incidents[0]).toMatchObject({
      status: "suspended",
      affectedArea: "新宿〜明大前",
      scope: {
        type: "segment",
        lineId: "Keio-Keio",
        fromStationId: "Keio.Shinjuku",
        toStationId: "Keio.Meidaimae",
      },
    });
  });
});
