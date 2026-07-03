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
    eyebrow: "ODPT TrainInformation",
    title: "Tokyo Rail Disruption Map",
    subtitle:
      "基于 ODPT TrainInformation 的首都圈运行异常可视化。当前版本通过服务端 API 获取数据，不爬取铁路公司、Yahoo 或 NAVITIME 等网页。",
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
      title: "运行状态总览",
      description:
        "线路来自 ODPT Railway；当前运行异常由 ODPT TrainInformation 提供。",
      ariaLabel: "东京铁路运行状态总览",
      scenario: "数据快照",
      zoomIn: "放大",
      zoomOut: "缩小",
      resetZoom: "适应",
      zoomLevel: "缩放",
    },
    detail: {
      title: "详情",
      emptyTitle: "全线路运行状态",
      affectedArea: "影响范围",
      reason: "原因",
      updatedAt: "更新时间",
      data: "数据",
      emptyAffectedArea: "ODPT Railway 中的线路会默认显示为正常。",
      emptyReason: "异常线路会在右侧列表展示；点击线路可查看来源详情。",
      emptyUpdatedAt: "以最新 ODPT 快照为准",
      dataPolicy:
        "ODPT TrainInformation 服务端 API；前端不直接持有或调用 ODPT key。",
      noLineIncident: "全线暂无异常信息",
    },
    legend: "状态图例",
    lines: "线路",
    abnormalLines: "异常线路",
    noTime: "--:--",
  },
  ja: {
    htmlLang: "ja",
    eyebrow: "ODPT TrainInformation",
    title: "Tokyo Rail Disruption Map",
    subtitle:
      "ODPT TrainInformation に基づく首都圏鉄道の運行異常可視化です。現在はサーバー API 経由で取得し、鉄道会社・Yahoo・NAVITIME 等のサイトはスクレイピングしません。",
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
      title: "運行ステータス一覧",
      description:
        "路線は ODPT Railway、異常情報は ODPT TrainInformation から取得します。",
      ariaLabel: "東京圏鉄道運行ステータス一覧",
      scenario: "データスナップショット",
      zoomIn: "拡大",
      zoomOut: "縮小",
      resetZoom: "全体",
      zoomLevel: "ズーム",
    },
    detail: {
      title: "詳細",
      emptyTitle: "全路線の運行ステータス",
      affectedArea: "影響範囲",
      reason: "理由",
      updatedAt: "更新時刻",
      data: "データ",
      emptyAffectedArea: "ODPT Railway の路線は通常運行として初期表示します。",
      emptyReason: "異常路線は右側の一覧に表示します。路線を選ぶと出典詳細を表示します。",
      emptyUpdatedAt: "最新の ODPT スナップショットに基づきます",
      dataPolicy:
        "ODPT TrainInformation のサーバー API です。ブラウザは ODPT key を保持せず、直接 ODPT にアクセスしません。",
      noLineIncident: "全線に異常情報なし",
    },
    legend: "ステータス凡例",
    lines: "路線",
    abnormalLines: "異常路線",
    noTime: "--:--",
  },
  en: {
    htmlLang: "en",
    eyebrow: "ODPT TrainInformation",
    title: "Tokyo Rail Disruption Map",
    subtitle:
      "A Tokyo-area disruption view backed by ODPT TrainInformation through a server API. It does not scrape railway-company, Yahoo, or NAVITIME pages.",
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
      title: "Operation Status Overview",
      description:
        "Lines come from ODPT Railway, with current disruptions from ODPT TrainInformation.",
      ariaLabel: "Tokyo rail operation status overview",
      scenario: "Data snapshot",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      resetZoom: "Fit",
      zoomLevel: "Zoom",
    },
    detail: {
      title: "Detail",
      emptyTitle: "All-line operation status",
      affectedArea: "Affected area",
      reason: "Reason",
      updatedAt: "Updated at",
      data: "Data",
      emptyAffectedArea: "ODPT Railway lines are shown as normal by default.",
      emptyReason: "Disrupted lines appear in the side list. Select a line to inspect source details.",
      emptyUpdatedAt: "Based on the latest ODPT snapshot",
      dataPolicy:
        "ODPT TrainInformation server API. The browser never stores the ODPT key or calls ODPT directly.",
      noLineIncident: "No line-wide disruption",
    },
    legend: "Status Legend",
    lines: "Lines",
    abnormalLines: "Abnormal Lines",
    noTime: "--:--",
  },
} as const;

export const snapshotCopies: Record<
  Locale,
  Record<string, { name: string; description: string }>
> = {
  zh: {
    "odpt-live-snapshot": {
      name: "ODPT 实时快照",
      description: "通过服务端 API 获取的 ODPT TrainInformation 数据，短缓存后自动刷新。",
    },
    "odpt-loading-snapshot": {
      name: "正在读取 ODPT",
      description: "正在从服务端 API 获取最新 ODPT TrainInformation。",
    },
  },
  ja: {
    "odpt-live-snapshot": {
      name: "ODPT ライブスナップショット",
      description: "サーバー API 経由で取得した ODPT TrainInformation を短期キャッシュして表示します。",
    },
    "odpt-loading-snapshot": {
      name: "ODPT 読み込み中",
      description: "サーバー API から最新の ODPT TrainInformation を取得しています。",
    },
  },
  en: {
    "odpt-live-snapshot": {
      name: "ODPT Live Snapshot",
      description:
        "Uses ODPT TrainInformation fetched by the server API with a short refresh cache.",
    },
    "odpt-loading-snapshot": {
      name: "Loading ODPT",
      description: "Loading the latest ODPT TrainInformation through the server API.",
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
