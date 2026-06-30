import type { RailStatus } from "./types";

export type Locale = "zh" | "ja" | "en";

export type ThemeMode = "light" | "dark";

export const localeLabels: Record<Locale, string> = {
  zh: "中",
  ja: "日",
  en: "EN",
};

export const themeLabels: Record<ThemeMode, Record<Locale, string>> = {
  light: {
    zh: "日间",
    ja: "昼",
    en: "Light",
  },
  dark: {
    zh: "夜间",
    ja: "夜",
    en: "Dark",
  },
};

export const copies = {
  zh: {
    htmlLang: "zh-CN",
    eyebrow: "Portfolio MVP",
    title: "Tokyo Rail Disruption Map",
    subtitle:
      "面向 ODPT 或 GTFS-RT 数据源预留 provider 边界的模拟运行监控面板。MVP 不爬取网页，也不接入第三方实时数据。",
    controls: {
      language: "语言",
      theme: "显示",
    },
    metrics: {
      lines: "对象线路",
      abnormal: "异常线路",
      updated: "更新",
    },
    map: {
      title: "简化线路视图",
      description: "用于演示的自定义示意坐标，不复刻官方线路图。",
      ariaLabel: "东京铁路异常简化线路图",
      scenario: "演示场景",
      zoomIn: "放大",
      zoomOut: "缩小",
      resetZoom: "适应",
      zoomLevel: "缩放",
    },
    detail: {
      title: "详情",
      emptyTitle: "请选择线路或区间",
      affectedArea: "影响范围",
      reason: "原因",
      updatedAt: "更新时间",
      data: "数据",
      emptyAffectedArea: "选择后显示",
      emptyReason: "当前没有可显示的异常信息。",
      emptyUpdatedAt: "无异常信息",
      dataPolicy:
        "当前为模拟场景数据。实时 provider 边界已为 ODPT 或 GTFS-RT 预留。",
      noLineIncident: "全线暂无异常信息",
    },
    legend: "状态图例",
    lines: "线路",
    noTime: "--:--",
  },
  ja: {
    htmlLang: "ja",
    eyebrow: "Portfolio MVP",
    title: "Tokyo Rail Disruption Map",
    subtitle:
      "ODPT または GTFS-RT の provider 境界を備えた模擬運行監視ダッシュボードです。MVP ではスクレイピングも外部リアルタイムデータ接続も行いません。",
    controls: {
      language: "言語",
      theme: "表示",
    },
    metrics: {
      lines: "対象路線",
      abnormal: "異常路線",
      updated: "更新",
    },
    map: {
      title: "簡略路線ビュー",
      description: "デモ用の独自模式座標です。公式路線図は複製していません。",
      ariaLabel: "東京圏鉄道異常の簡略路線図",
      scenario: "デモシナリオ",
      zoomIn: "拡大",
      zoomOut: "縮小",
      resetZoom: "全体",
      zoomLevel: "ズーム",
    },
    detail: {
      title: "詳細",
      emptyTitle: "路線または区間を選択",
      affectedArea: "影響範囲",
      reason: "理由",
      updatedAt: "更新時刻",
      data: "データ",
      emptyAffectedArea: "選択後に表示",
      emptyReason: "現在表示できる異常情報はありません。",
      emptyUpdatedAt: "異常情報なし",
      dataPolicy:
        "現在は模擬シナリオデータです。ODPT または GTFS-RT 向けの provider 境界を用意しています。",
      noLineIncident: "全線に異常情報なし",
    },
    legend: "ステータス凡例",
    lines: "路線",
    noTime: "--:--",
  },
  en: {
    htmlLang: "en",
    eyebrow: "Portfolio MVP",
    title: "Tokyo Rail Disruption Map",
    subtitle:
      "A simulated operations dashboard with a provider boundary for ODPT or GTFS-RT data. The MVP does not scrape websites or connect to third-party live data.",
    controls: {
      language: "Language",
      theme: "Theme",
    },
    metrics: {
      lines: "Lines",
      abnormal: "Abnormal",
      updated: "Updated",
    },
    map: {
      title: "Simplified Network View",
      description:
        "Custom schematic coordinates for demo use, without copying official rail map artwork.",
      ariaLabel: "Simplified Tokyo rail disruption map",
      scenario: "Demo scenario",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      resetZoom: "Fit",
      zoomLevel: "Zoom",
    },
    detail: {
      title: "Detail",
      emptyTitle: "Select a line or segment",
      affectedArea: "Affected area",
      reason: "Reason",
      updatedAt: "Updated at",
      data: "Data",
      emptyAffectedArea: "Shown after selection",
      emptyReason: "There is no disruption detail to show right now.",
      emptyUpdatedAt: "No disruption information",
      dataPolicy:
        "Mock scenario data only. A real-time provider boundary is ready for ODPT or GTFS-RT.",
      noLineIncident: "No line-wide disruption",
    },
    legend: "Status Legend",
    lines: "Lines",
    noTime: "--:--",
  },
} as const;

export const scenarioCopies: Record<
  Locale,
  Record<string, { name: string; description: string }>
> = {
  zh: {
    "all-normal": {
      name: "全部正常",
      description: "所有对象线路均处于正常运行状态。",
    },
    "denentoshi-suspended-section": {
      name: "田园都市线 区间停运",
      description: "假设渋谷至二子玉川区间发生暂停运行。",
    },
    "hanzomon-through-service-delay": {
      name: "半藏门线 直通影响",
      description: "假设因直通运行线路影响，半藏门线全线发生延误。",
    },
    "multiple-disruptions": {
      name: "多线路同时异常",
      description: "用于展示多条线路同时出现不同异常状态的场景。",
    },
  },
  ja: {
    "all-normal": {
      name: "全部正常",
      description: "すべての対象路線が通常運行している状態です。",
    },
    "denentoshi-suspended-section": {
      name: "田園都市線 区間停運",
      description: "渋谷〜二子玉川で運転見合わせが発生している想定です。",
    },
    "hanzomon-through-service-delay": {
      name: "半蔵門線 直通影響",
      description: "直通運転先の影響により半蔵門線全体に遅れがある想定です。",
    },
    "multiple-disruptions": {
      name: "複数路線 同時異常",
      description: "複数の路線で異なる種類の異常が出ている展示用シナリオです。",
    },
  },
  en: {
    "all-normal": {
      name: "All Normal",
      description: "All selected lines are operating normally.",
    },
    "denentoshi-suspended-section": {
      name: "Den-en-toshi Section Suspended",
      description:
        "A demo scenario where service is suspended between Shibuya and Futako-tamagawa.",
    },
    "hanzomon-through-service-delay": {
      name: "Hanzomon Through-Service Delay",
      description:
        "A demo scenario where Hanzomon Line delays are caused by through-service impact.",
    },
    "multiple-disruptions": {
      name: "Multiple Simultaneous Disruptions",
      description:
        "A demo scenario with several lines showing different disruption types at once.",
    },
  },
};

export const statusCopies: Record<
  Locale,
  Record<RailStatus, { label: string; description: string }>
> = {
  zh: {
    normal: { label: "正常", description: "正常运行" },
    delayed: { label: "延误", description: "延误" },
    suspended: { label: "停运", description: "暂停运行" },
    reduced: { label: "运行减少", description: "减少班次" },
    unknown: { label: "未知", description: "确认中" },
  },
  ja: {
    normal: { label: "正常", description: "通常運行" },
    delayed: { label: "遅延", description: "遅延" },
    suspended: { label: "運休", description: "運転見合わせ" },
    reduced: { label: "減便", description: "運転本数減" },
    unknown: { label: "不明", description: "確認中" },
  },
  en: {
    normal: { label: "Normal", description: "Normal service" },
    delayed: { label: "Delayed", description: "Delayed" },
    suspended: { label: "Suspended", description: "Service suspended" },
    reduced: { label: "Reduced", description: "Reduced service" },
    unknown: { label: "Unknown", description: "Checking status" },
  },
};
