import type { DemoScenario } from "./types";

export const demoScenarios: DemoScenario[] = [
  {
    id: "all-normal",
    name: "全部正常",
    description: "すべての対象路線が通常運行している状態です。",
    incidents: [],
  },
  {
    id: "denentoshi-suspended-section",
    name: "田園都市線 区間停運",
    description: "渋谷〜二子玉川で運転見合わせが発生している想定です。",
    incidents: [
      {
        id: "incident-denentoshi-shibuya-futako",
        status: "suspended",
        title: "渋谷〜二子玉川で運転見合わせ",
        reason: "設備点検のため、該当区間で運転を見合わせています。",
        scope: {
          type: "segment",
          lineId: "denentoshi",
          fromStationId: "shibuya",
          toStationId: "futako-tamagawa",
        },
        affectedArea: "渋谷〜二子玉川",
        updatedAt: "2026-06-30T16:20:00+09:00",
        note: "第一版の架空デモデータです。",
      },
    ],
  },
  {
    id: "hanzomon-through-service-delay",
    name: "半蔵門線 直通影響",
    description: "直通運転先の影響により半蔵門線全体に遅れがある想定です。",
    incidents: [
      {
        id: "incident-hanzomon-delay",
        status: "delayed",
        title: "直通運転の影響で遅延",
        reason: "直通運転先での混雑集中により、上下線の一部列車に遅れが出ています。",
        scope: {
          type: "line",
          lineId: "hanzomon",
        },
        affectedArea: "半蔵門線 全線",
        updatedAt: "2026-06-30T16:35:00+09:00",
        note: "実在の運行情報ではありません。",
      },
    ],
  },
  {
    id: "multiple-disruptions",
    name: "複数路線 同時異常",
    description: "複数の路線で異なる種類の異常が出ている展示用シナリオです。",
    incidents: [
      {
        id: "incident-yokosuka-reduced",
        status: "reduced",
        title: "横須賀線で運転本数を減らしています",
        reason: "車両点検の影響で、一部列車の運転間隔が広がっています。",
        scope: {
          type: "line",
          lineId: "yokosuka",
        },
        affectedArea: "横須賀線 全線",
        updatedAt: "2026-06-30T16:42:00+09:00",
      },
      {
        id: "incident-nambu-delay",
        status: "delayed",
        title: "南武線 武蔵小杉〜登戸で遅延",
        reason: "混雑集中のため、川崎方面の一部列車に遅れが出ています。",
        scope: {
          type: "segment",
          lineId: "nambu",
          fromStationId: "musashi-kosugi",
          toStationId: "noborito",
        },
        affectedArea: "武蔵小杉〜登戸",
        updatedAt: "2026-06-30T16:48:00+09:00",
      },
      {
        id: "incident-yamanote-unknown",
        status: "unknown",
        title: "山手線の一部情報を確認中",
        reason: "運行情報の更新待ちです。詳細は確認中です。",
        scope: {
          type: "line",
          lineId: "yamanote",
        },
        affectedArea: "山手線 全線",
        updatedAt: "2026-06-30T16:50:00+09:00",
      },
    ],
  },
];
