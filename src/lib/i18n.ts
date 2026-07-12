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
    title: "东京铁路运行异常地图",
    subtitle:
      "首都圈铁路运行异常可视化。当前版本通过服务端 API 获取实时运行信息。",
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
        "显示免费铁路地图图层；由于线路数据查询限制，选择异常线路后仅定位到线路附近，位置并不精确。",
      ariaLabel: "东京铁路运行状态总览",
      scenario: "数据快照",
      zoomIn: "放大",
      zoomOut: "缩小",
      resetZoom: "重置视图",
      zoomLevel: "缩放",
      selectedLine: "线路附近（近似）：{line}",
      noLineTarget:
        "选择异常线路后，会尝试定位到线路附近；受数据查询限制，位置仅供参考。",
      freeLayerLabel: "免费瓦片",
      lineFallbackLabel: "线路级信息",
      lineFallbackDescription:
        "当前线路暂时无法取得地图坐标，因此只显示线路异常提示。",
    },
    detail: {
      title: "详情",
      emptyTitle: "选择一条异常线路",
      affectedArea: "影响范围",
      reason: "原因",
      updatedAt: "更新时间",
      data: "来源",
      emptyAffectedArea: "点击下方异常线路后显示。",
      emptyReason:
        "当前侧栏只展示 ODPT TrainInformation 能返回并映射到线路的异常。",
      emptyUpdatedAt: "以最新 ODPT 快照为准",
      dataPolicy: "ODPT TrainInformation / 服务端 API",
      noLineIncident: "全线暂无异常信息",
    },
    sidePanel: {
      sourceName: "ODPT TrainInformation",
      sourceNote:
        "范围：仅显示 ODPT 当前公开/返回的数据，可能不覆盖所有运营方和实际运行异常。",
      sourceReference: "官方说明",
      sourceCatalog: "数据目录",
      countUnit: "条",
      openDetail: "查看详情",
      noAbnormal: "当前 ODPT 数据未返回可显示的异常线路",
      validUntil: "有效至",
    },
    legend: "状态图例",
    lines: "线路",
    abnormalLines: "异常线路",
    noTime: "--:--",
  },
  ja: {
    htmlLang: "ja",
    eyebrow: "ODPT TrainInformation",
    title: "東京鉄道運行異常マップ",
    subtitle:
      "首都圏鉄道の運行異常を可視化します。現在はサーバー API 経由でリアルタイム運行情報を取得します。",
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
        "無料の鉄道マップレイヤーを表示します。路線データの取得制限により、異常路線を選択しても路線付近への概略表示となり、位置は正確ではありません。",
      ariaLabel: "東京圏鉄道運行ステータス一覧",
      scenario: "データスナップショット",
      zoomIn: "拡大",
      zoomOut: "縮小",
      resetZoom: "表示範囲を戻す",
      zoomLevel: "ズーム",
      selectedLine: "路線付近（概略）：{line}",
      noLineTarget:
        "異常路線を選ぶと路線付近に移動します。データ取得の制限により、位置は目安です。",
      freeLayerLabel: "無料タイル",
      lineFallbackLabel: "路線単位の情報",
      lineFallbackDescription:
        "現在の路線について地図座標を取得できないため、路線の異常のみを表示しています。",
    },
    detail: {
      title: "詳細",
      emptyTitle: "異常路線を選択",
      affectedArea: "影響範囲",
      reason: "理由",
      updatedAt: "更新時刻",
      data: "出典",
      emptyAffectedArea: "下の異常路線を選ぶと表示します。",
      emptyReason:
        "このサイドパネルは ODPT TrainInformation で取得・路線化できる異常のみを表示します。",
      emptyUpdatedAt: "最新の ODPT スナップショットに基づきます",
      dataPolicy: "ODPT TrainInformation / サーバー API",
      noLineIncident: "全線に異常情報なし",
    },
    sidePanel: {
      sourceName: "ODPT TrainInformation",
      sourceNote:
        "範囲：ODPT が現在公開・返却しているデータのみを表示しており、すべての事業者・実際の運行異常を網羅するものではありません。",
      sourceReference: "公式説明",
      sourceCatalog: "データカタログ",
      countUnit: "件",
      openDetail: "詳細",
      noAbnormal: "現在の ODPT データには表示できる異常路線がありません",
      validUntil: "有効期限",
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
      "A Tokyo-area rail disruption view backed by live operation notices through the server API.",
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
        "Shows a free railway map layer. Due to line-data query limitations, a selected disruption is located near the line only and may not be exact.",
      ariaLabel: "Tokyo rail operation status overview",
      scenario: "Data snapshot",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      resetZoom: "Reset view",
      zoomLevel: "Zoom",
      selectedLine: "Approximate line area: {line}",
      noLineTarget:
        "Select a disrupted line to move near it. Due to data-query limitations, the location is approximate.",
      freeLayerLabel: "Free tiles",
      lineFallbackLabel: "Line-level notice",
      lineFallbackDescription:
        "Line coordinates could not be loaded for this detail, so only the line notice is shown.",
    },
    detail: {
      title: "Detail",
      emptyTitle: "Select a disrupted line",
      affectedArea: "Affected area",
      reason: "Reason",
      updatedAt: "Updated at",
      data: "Source",
      emptyAffectedArea: "Shown after selecting a disrupted line below.",
      emptyReason:
        "This side panel shows only disruptions returned by ODPT TrainInformation and mapped to a line.",
      emptyUpdatedAt: "Based on the latest ODPT snapshot",
      dataPolicy: "ODPT TrainInformation / server API",
      noLineIncident: "No line-wide disruption",
    },
    sidePanel: {
      sourceName: "ODPT TrainInformation",
      sourceNote:
        "Scope: shows only data currently published or returned by ODPT; it may not cover every operator or real-world disruption.",
      sourceReference: "Official note",
      sourceCatalog: "Data catalog",
      countUnit: "",
      openDetail: "Details",
      noAbnormal: "Current ODPT data returns no displayable disrupted lines",
      validUntil: "Valid until",
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
      description:
        "通过服务端 API 获取的 ODPT TrainInformation 数据，短缓存后自动刷新。",
    },
    "odpt-loading-snapshot": {
      name: "正在读取 ODPT",
      description: "正在从服务端 API 获取最新 ODPT TrainInformation。",
    },
  },
  ja: {
    "odpt-live-snapshot": {
      name: "ODPT ライブスナップショット",
      description:
        "サーバー API 経由で取得した ODPT TrainInformation を短期キャッシュして表示します。",
    },
    "odpt-loading-snapshot": {
      name: "ODPT 読み込み中",
      description:
        "サーバー API から最新の ODPT TrainInformation を取得しています。",
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
      description:
        "Loading the latest ODPT TrainInformation through the server API.",
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
    unknown: { label: "确认中", description: "待确认状态" },
  },
  ja: {
    normal: { label: "正常", description: "通常運行" },
    delayed: { label: "遅延", description: "遅延" },
    suspended: { label: "運休", description: "運転見合わせ" },
    reduced: { label: "減便", description: "運転本数減" },
    unknown: { label: "確認中", description: "状態確認中" },
  },
  en: {
    normal: { label: "Normal", description: "Normal service" },
    delayed: { label: "Delayed", description: "Delayed" },
    suspended: { label: "Suspended", description: "Service suspended" },
    reduced: { label: "Reduced", description: "Reduced service" },
    unknown: { label: "Checking", description: "Status being checked" },
  },
};
