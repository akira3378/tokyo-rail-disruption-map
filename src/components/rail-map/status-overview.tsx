import type { LineViewModel, RailStatus, Selection } from "@/lib/types";

type RailStatusOverviewProps = {
  lines: LineViewModel[];
  selection: Selection | null;
  statusText: Record<RailStatus, { label: string; description: string }>;
  onSelectLine: (lineId: string) => void;
};

export function RailStatusOverview({
  lines,
  selection,
  statusText,
  onSelectLine,
}: RailStatusOverviewProps) {
  const sortedLines = [...lines].sort((a, b) => {
    const aAbnormal = a.status === "normal" ? 1 : 0;
    const bAbnormal = b.status === "normal" ? 1 : 0;

    return aAbnormal - bAbnormal || a.operator.localeCompare(b.operator) || a.name.localeCompare(b.name);
  });

  if (sortedLines.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-sm font-semibold text-[var(--muted)]">
        Loading ODPT Railway data...
      </div>
    );
  }

  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
      {sortedLines.map((line) => {
        const isAbnormal = line.status !== "normal";
        const selected =
          selection?.type === "line" && selection.lineId === line.id;

        return (
          <button
            key={line.id}
            type="button"
            onClick={() => onSelectLine(line.id)}
            className={`group min-h-24 rounded-lg border bg-[var(--panel)] p-3 text-left shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--panel-strong)] ${
              selected ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/25" : "border-[var(--border)]"
            } ${isAbnormal ? "rail-alert-blink" : ""}`}
            style={{
              borderLeftColor: line.color,
              borderLeftWidth: "0.45rem",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--foreground)]">
                  {line.name}
                </p>
                <p className="mt-1 truncate text-xs font-medium text-[var(--muted)]">
                  {line.nameEn ?? line.operator}
                </p>
              </div>
              <span className={`status-badge status-badge-${line.status}`}>
                {statusText[line.status].label}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="truncate text-xs text-[var(--muted)]">
                {line.operator}
              </span>
              <span
                className="h-2.5 w-12 rounded-full"
                style={{ backgroundColor: line.color }}
                aria-hidden="true"
              />
            </div>
            {line.incident ? (
              <p className="status-overview-reason mt-2 text-xs font-semibold text-[var(--foreground)]">
                {line.incident.reason}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
