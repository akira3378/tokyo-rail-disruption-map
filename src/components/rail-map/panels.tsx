import {
  copies,
  localeLabels,
  snapshotCopies,
  statusCopies,
  themeLabels,
  type Locale,
  type ThemeMode,
} from "@/lib/i18n";
import { formatDateTime } from "@/lib/map/format";
import type { DetailModel } from "@/lib/map/detail-model";
import type { OperationSnapshot, LineViewModel, RailStatus } from "@/lib/types";

export function DetailPanel({
  detail,
  operation,
  copy,
  locale,
  statusText,
}: {
  detail?: DetailModel;
  operation: OperationSnapshot;
  copy: (typeof copies)[Locale];
  locale: Locale;
  statusText: Record<RailStatus, { label: string; description: string }>;
}) {
  const operationText = getOperationText(operation, locale);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {copy.detail.title}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">
            {detail?.title ?? copy.detail.emptyTitle}
          </h2>
        </div>
        {detail ? (
          <StatusBadge
            status={detail.status}
            label={statusText[detail.status].label}
          />
        ) : null}
      </div>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {detail?.subtitle ?? operationText.description}
      </p>

      <div className="mt-4 grid gap-3 text-sm">
        <DetailRow
          label={copy.detail.affectedArea}
          value={detail?.affectedArea ?? copy.detail.emptyAffectedArea}
        />
        <DetailRow
          label={copy.detail.reason}
          value={detail?.incident?.reason ?? copy.detail.emptyReason}
        />
        <DetailRow
          label={copy.detail.updatedAt}
          value={formatDateTime(detail?.incident?.updatedAt, copy)}
        />
        <DetailRow
          label={copy.detail.data}
          value={formatIncidentSource(detail?.incident) ?? copy.detail.dataPolicy}
        />
      </div>
    </section>
  );
}

export function LineStatusList({
  title,
  lines,
  statusText,
  onSelectLine,
}: {
  title: string;
  lines: LineViewModel[];
  statusText: Record<RailStatus, { label: string; description: string }>;
  onSelectLine: (lineId: string) => void;
}) {
  const abnormalLines = lines
    .filter((line) => line.status !== "normal")
    .sort(
      (a, b) =>
        a.operator.localeCompare(b.operator) || a.name.localeCompare(b.name),
    );

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
      {abnormalLines.length === 0 ? (
        <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-3 text-sm font-medium text-[var(--muted)]">
          当前没有异常线路
        </p>
      ) : (
        <div className="mt-3 grid max-h-[520px] gap-2 overflow-auto pr-1">
          {abnormalLines.map((line) => (
            <button
              key={line.id}
              type="button"
              onClick={() => onSelectLine(line.id)}
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-left transition hover:border-[var(--accent)] hover:bg-[var(--panel)]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                  {line.name}
                </span>
                <span className="block text-xs text-[var(--muted)]">
                  {line.operator}
                </span>
              </span>
              <span className="flex items-center gap-2">
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

function formatIncidentSource(incident?: DetailModel["incident"]) {
  if (!incident?.source) {
    return undefined;
  }

  const { raw } = incident.source;

  return [
    incident.source.resourceType,
    raw["owl:sameAs"],
    raw["dct:valid"] ? `dct:valid: ${raw["dct:valid"]}` : null,
  ]
    .filter(Boolean)
    .join(" / ");
}

function getOperationText(operation: OperationSnapshot, locale: Locale) {
  return snapshotCopies[locale][operation.id] ?? operation;
}
