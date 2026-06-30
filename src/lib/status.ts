import type { RailStatus } from "./types";

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
