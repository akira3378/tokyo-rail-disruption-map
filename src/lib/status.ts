import type { RailStatus } from "./types";

export const statusLabels: Record<RailStatus, string> = {
  normal: "正常",
  delayed: "延误",
  suspended: "停运",
  reduced: "运行减少",
  unknown: "未知",
};

export const statusDescriptions: Record<RailStatus, string> = {
  normal: "通常運行",
  delayed: "遅延",
  suspended: "運転見合わせ",
  reduced: "運転本数減",
  unknown: "確認中",
};

export const statusStrokeClasses: Record<RailStatus, string> = {
  normal: "stroke-slate-400",
  delayed: "stroke-amber-500",
  suspended: "stroke-red-500",
  reduced: "stroke-violet-500",
  unknown: "stroke-slate-700",
};

export const statusBadgeClasses: Record<RailStatus, string> = {
  normal: "border-slate-300 bg-slate-100 text-slate-700",
  delayed: "border-amber-300 bg-amber-100 text-amber-800",
  suspended: "border-red-300 bg-red-100 text-red-800",
  reduced: "border-violet-300 bg-violet-100 text-violet-800",
  unknown: "border-slate-400 bg-slate-800 text-white",
};
