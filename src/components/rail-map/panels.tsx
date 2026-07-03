import {
  copies,
  localeLabels,
  statusCopies,
  themeLabels,
  type Locale,
  type ThemeMode,
} from "@/lib/i18n";
import { formatDateTime, formatTime } from "@/lib/map/format";
import type { DetailModel } from "@/lib/map/detail-model";
import type { LineViewModel, RailStatus } from "@/lib/types";

const statusOrder: Record<RailStatus, number> = {
  suspended: 0,
  delayed: 1,
  reduced: 2,
  unknown: 3,
  normal: 4,
};

export function DetailPanel({
  detail,
  copy,
  statusText,
}: {
  detail: DetailModel;
  copy: (typeof copies)[Locale];
  statusText: Record<RailStatus, { label: string; description: string }>;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {copy.detail.title}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">
            {detail.title}
          </h2>
        </div>
        <StatusBadge
          status={detail.status}
          label={statusText[detail.status].label}
        />
      </div>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {detail.subtitle}
      </p>

      <div className="mt-4 grid gap-3 text-sm">
        <DetailRow
          label={copy.detail.affectedArea}
          value={detail.affectedArea}
        />
        <DetailRow
          label={copy.detail.reason}
          value={detail.incident?.reason ?? copy.detail.emptyReason}
        />
        <DetailRow
          label={copy.detail.updatedAt}
          value={formatDateTime(detail.incident?.updatedAt, copy)}
        />
        <DetailRow label={copy.detail.data} value={formatIncidentSource(detail, copy)} />
      </div>
    </section>
  );
}

export function LineStatusList({
  title,
  lines,
  copy,
  locale,
  statusText,
  onSelectLine,
}: {
  title: string;
  lines: LineViewModel[];
  copy: (typeof copies)[Locale];
  locale: Locale;
  statusText: Record<RailStatus, { label: string; description: string }>;
  onSelectLine: (lineId: string) => void;
}) {
  const abnormalLines = lines
    .filter((line) => line.status !== "normal")
    .sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        a.operator.localeCompare(b.operator) || a.name.localeCompare(b.name),
    );

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            {copy.sidePanel.sourceNote}
          </p>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
          {formatCount(copy.sidePanel.countLabel, abnormalLines.length)}
        </span>
      </div>
      {abnormalLines.length === 0 ? (
        <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-3 text-sm font-medium text-[var(--muted)]">
          {copy.sidePanel.noAbnormal}
        </p>
      ) : (
        <div className="mt-3 grid max-h-[520px] gap-2 overflow-auto pr-1">
          {abnormalLines.map((line) => (
            <button
              key={line.id}
              type="button"
              onClick={() => onSelectLine(line.id)}
              className="grid gap-2 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2.5 text-left transition hover:border-[var(--accent)] hover:bg-[var(--panel)]"
            >
              <span className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                    {line.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--muted)]">
                    {line.operator}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: line.color }}
                    aria-hidden="true"
                  />
                  <StatusBadge
                    status={line.status}
                    label={statusText[line.status].label}
                  />
                </span>
              </span>
              <span className="grid gap-1">
                <span className="line-clamp-2 text-xs leading-5 text-[var(--foreground)]">
                  {line.incident?.reason ?? statusText[line.status].description}
                </span>
                <span className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                  <span>
                    {formatTime(line.incident?.updatedAt, locale, copy.noTime)}
                  </span>
                  <span>{copy.sidePanel.openDetail}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function Toolbar({
  copy,
  locale,
  theme,
  onLocaleChange,
  onThemeChange,
}: {
  copy: (typeof copies)[Locale];
  locale: Locale;
  theme: ThemeMode;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (theme: ThemeMode) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--panel)] p-1">
        <span className="px-2 font-semibold text-[var(--muted)]">
          {copy.controls.language}
        </span>
        {(["zh", "ja", "en"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onLocaleChange(item)}
            className={`rounded px-2.5 py-1 font-semibold transition ${
              locale === item
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            {localeLabels[item]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--panel)] p-1">
        <span className="px-2 font-semibold text-[var(--muted)]">
          {copy.controls.theme}
        </span>
        {(["light", "dark"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onThemeChange(item)}
            className={`rounded px-2.5 py-1 font-semibold transition ${
              theme === item
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            {themeLabels[item][locale]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: RailStatus; label?: string }) {
  return (
    <span className={`status-badge status-badge-${status}`}>
      {label ?? statusCopies.zh[status].label}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 leading-6 text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function formatIncidentSource(
  detail: DetailModel,
  copy: (typeof copies)[Locale],
) {
  const incident = detail.incident;

  if (!incident?.source) {
    return copy.detail.dataPolicy;
  }

  const { raw } = incident.source;
  const sourceName =
    incident.source.provider === "yahoo"
      ? copy.sidePanel.supplementalSourceName
      : copy.sidePanel.sourceName;
  const validUntil = "dct:valid" in raw && raw["dct:valid"]
    ? `${copy.sidePanel.validUntil} ${formatDateTime(raw["dct:valid"], copy)}`
    : null;

  return [sourceName, validUntil]
    .filter(Boolean)
    .join(" / ");
}

function formatCount(template: string, count: number) {
  return template.replace("{count}", String(count));
}
