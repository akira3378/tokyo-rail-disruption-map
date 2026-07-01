import type { OdptIncidentResolution, OdptMockScenario } from "./odpt-types";

const context = "http://vocab.odpt.org/context_odpt.jsonld";

export const odptMockTrainInformationScenarios: OdptMockScenario[] = [
  {
    id: "all-normal",
    name: "全部正常",
    description: "すべての対象路線が通常運行している状態です。",
    records: [],
  },
  {
    id: "denentoshi-suspended-section",
    name: "田園都市線 区間停運",
    description: "渋谷〜二子玉川で運転見合わせが発生している想定です。",
    records: [
      {
        "@context": context,
        "@id": "urn:tokyo-rail-map:mock:TrainInformation:Tokyu.Denentoshi.20260630T1620",
        "@type": "odpt:TrainInformation",
        "owl:sameAs":
          "odpt.TrainInformation:Tokyu.Denentoshi.20260630T1620",
        "dc:date": "2026-06-30T16:20:00+09:00",
        "dct:valid": "2026-06-30T16:30:00+09:00",
        "odpt:operator": "odpt.Operator:Tokyu",
        "odpt:railway": "odpt.Railway:Tokyu.Denentoshi",
        "odpt:railwayTitle": {
          ja: "東急田園都市線",
          en: "Tokyu Den-en-toshi Line",
        },
        "odpt:timeOfOrigin": "2026-06-30T16:12:00+09:00",
        "odpt:trainInformationStatus": {
          ja: "運転見合わせ",
          en: "Service suspended",
        },
        "odpt:trainInformationCause": {
          ja: "設備点検",
          en: "Facility inspection",
        },
        "odpt:trainInformationRange": {
          ja: "渋谷〜二子玉川",
          en: "Shibuya - Futako-tamagawa",
        },
        "odpt:trainInformationText": {
          ja: "設備点検のため、渋谷〜二子玉川駅間で運転を見合わせています。",
          en: "Service is suspended between Shibuya and Futako-tamagawa due to facility inspection.",
        },
      },
    ],
  },
  {
    id: "hanzomon-through-service-delay",
    name: "半蔵門線 直通影響",
    description: "直通運転先の影響により半蔵門線全体に遅れがある想定です。",
    records: [
      {
        "@context": context,
        "@id": "urn:tokyo-rail-map:mock:TrainInformation:TokyoMetro.Hanzomon.20260630T1635",
        "@type": "odpt:TrainInformation",
        "owl:sameAs":
          "odpt.TrainInformation:TokyoMetro.Hanzomon.20260630T1635",
        "dc:date": "2026-06-30T16:35:00+09:00",
        "dct:valid": "2026-06-30T16:45:00+09:00",
        "odpt:operator": "odpt.Operator:TokyoMetro",
        "odpt:railway": "odpt.Railway:TokyoMetro.Hanzomon",
        "odpt:railwayTitle": {
          ja: "東京メトロ半蔵門線",
          en: "Tokyo Metro Hanzomon Line",
        },
        "odpt:timeOfOrigin": "2026-06-30T16:26:00+09:00",
        "odpt:trainInformationStatus": {
          ja: "遅延",
          en: "Delayed",
        },
        "odpt:trainInformationCause": {
          ja: "直通運転先の混雑",
          en: "Congestion on through-service line",
        },
        "odpt:trainInformationRange": {
          ja: "全線",
          en: "All line",
        },
        "odpt:trainInformationText": {
          ja: "直通運転先での混雑集中により、上下線の一部列車に遅れが出ています。",
          en: "Some trains are delayed due to congestion on a through-service line.",
        },
      },
    ],
  },
  {
    id: "multiple-disruptions",
    name: "複数路線 同時異常",
    description: "複数の路線で異なる種類の異常が出ている展示用シナリオです。",
    records: [
      {
        "@context": context,
        "@id": "urn:tokyo-rail-map:mock:TrainInformation:JR-East.Yokosuka.20260630T1642",
        "@type": "odpt:TrainInformation",
        "owl:sameAs":
          "odpt.TrainInformation:JR-East.Yokosuka.20260630T1642",
        "dc:date": "2026-06-30T16:42:00+09:00",
        "dct:valid": "2026-06-30T16:52:00+09:00",
        "odpt:operator": "odpt.Operator:JR-East",
        "odpt:railway": "odpt.Railway:JR-East.Yokosuka",
        "odpt:railwayTitle": {
          ja: "横須賀線",
          en: "Yokosuka Line",
        },
        "odpt:trainInformationStatus": {
          ja: "運転本数減少",
          en: "Reduced service",
        },
        "odpt:trainInformationCause": {
          ja: "車両点検",
          en: "Rolling stock inspection",
        },
        "odpt:trainInformationRange": {
          ja: "全線",
          en: "All line",
        },
        "odpt:trainInformationText": {
          ja: "車両点検の影響で、一部列車の運転間隔が広がっています。",
          en: "Some train intervals are wider due to rolling stock inspection.",
        },
      },
      {
        "@context": context,
        "@id": "urn:tokyo-rail-map:mock:TrainInformation:JR-East.Nambu.20260630T1648",
        "@type": "odpt:TrainInformation",
        "owl:sameAs": "odpt.TrainInformation:JR-East.Nambu.20260630T1648",
        "dc:date": "2026-06-30T16:48:00+09:00",
        "dct:valid": "2026-06-30T16:58:00+09:00",
        "odpt:operator": "odpt.Operator:JR-East",
        "odpt:railway": "odpt.Railway:JR-East.Nambu",
        "odpt:railwayTitle": {
          ja: "JR南武線",
          en: "JR Nambu Line",
        },
        "odpt:trainInformationStatus": {
          ja: "遅延",
          en: "Delayed",
        },
        "odpt:trainInformationCause": {
          ja: "混雑集中",
          en: "Passenger congestion",
        },
        "odpt:trainInformationRange": {
          ja: "武蔵小杉〜登戸",
          en: "Musashi-kosugi - Noborito",
        },
        "odpt:trainInformationText": {
          ja: "混雑集中のため、川崎方面の一部列車に遅れが出ています。",
          en: "Some trains toward Kawasaki are delayed due to passenger congestion.",
        },
      },
      {
        "@context": context,
        "@id": "urn:tokyo-rail-map:mock:TrainInformation:JR-East.Yamanote.20260630T1650",
        "@type": "odpt:TrainInformation",
        "owl:sameAs":
          "odpt.TrainInformation:JR-East.Yamanote.20260630T1650",
        "dc:date": "2026-06-30T16:50:00+09:00",
        "dct:valid": "2026-06-30T17:00:00+09:00",
        "odpt:operator": "odpt.Operator:JR-East",
        "odpt:railway": "odpt.Railway:JR-East.Yamanote",
        "odpt:railwayTitle": {
          ja: "JR山手線",
          en: "JR Yamanote Line",
        },
        "odpt:trainInformationStatus": {
          ja: "確認中",
          en: "Confirming",
        },
        "odpt:trainInformationCause": {
          ja: "情報確認中",
          en: "Information under confirmation",
        },
        "odpt:trainInformationRange": {
          ja: "全線",
          en: "All line",
        },
        "odpt:trainInformationText": {
          ja: "運行情報の更新待ちです。詳細は確認中です。",
          en: "Waiting for an operation information update. Details are being confirmed.",
        },
      },
    ],
  },
];

export const odptIncidentResolutionBySameAs: Record<
  string,
  OdptIncidentResolution
> = {
  "odpt.TrainInformation:Tokyu.Denentoshi.20260630T1620": {
    status: "suspended",
    scope: {
      type: "segment",
      lineId: "denentoshi",
      fromStationId: "shibuya",
      toStationId: "futako-tamagawa",
    },
    affectedArea: "渋谷〜二子玉川",
  },
  "odpt.TrainInformation:TokyoMetro.Hanzomon.20260630T1635": {
    status: "delayed",
    scope: {
      type: "line",
      lineId: "hanzomon",
    },
    affectedArea: "半蔵門線 全線",
  },
  "odpt.TrainInformation:JR-East.Yokosuka.20260630T1642": {
    status: "reduced",
    scope: {
      type: "line",
      lineId: "yokosuka",
    },
    affectedArea: "横須賀線 全線",
  },
  "odpt.TrainInformation:JR-East.Nambu.20260630T1648": {
    status: "delayed",
    scope: {
      type: "segment",
      lineId: "nambu",
      fromStationId: "musashi-kosugi",
      toStationId: "noborito",
    },
    affectedArea: "武蔵小杉〜登戸",
  },
  "odpt.TrainInformation:JR-East.Yamanote.20260630T1650": {
    status: "unknown",
    scope: {
      type: "line",
      lineId: "yamanote",
    },
    affectedArea: "山手線 全線",
  },
};
