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
import { panelFrameClassName } from "./styles";

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
    <section className={`${panelFrameClassName} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">
            {copy.detail.title}
          </p>
          <h2 className="text-copy mt-1 text-xl font-semibold">
            {detail.title}
          </h2>
        </div>
        <StatusBadge
          status={detail.status}
          label={statusText[detail.status].label}
        />
      </div>

      <p className="text-muted mt-2 text-sm leading-6">{detail.subtitle}</p>

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
        <DetailRow
          label={copy.detail.data}
          value={formatIncidentSource(detail, copy)}
        />
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
        a.operator.localeCompare(b.operator) ||
        a.name.localeCompare(b.name),
    );

  return (
    <section className={`${panelFrameClassName} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-copy text-sm font-semibold">{title}</h2>
          <CoverageNote copy={copy} />
        </div>
        <CountBadge count={abnormalLines.length} copy={copy} />
      </div>
      {abnormalLines.length === 0 ? (
        <p className="border-line bg-panel-strong text-muted mt-3 rounded-md border px-3 py-3 text-sm font-medium">
          {copy.sidePanel.noAbnormal}
        </p>
      ) : (
        <div className="mt-3 grid max-h-[520px] gap-2 overflow-auto pr-1">
          {abnormalLines.map((line) => (
            <button
              key={line.id}
              type="button"
              onClick={() => onSelectLine(line.id)}
              className="border-line bg-panel-strong hover:border-accent hover:bg-panel grid gap-2 rounded-md border px-3 py-2.5 text-left transition"
            >
              <span className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-copy block truncate text-sm font-semibold">
                    {line.name}
                  </span>
                  <span className="text-muted block truncate text-xs">
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
                <span className="text-copy line-clamp-2 text-xs leading-5">
                  {line.incident?.reason ?? statusText[line.status].description}
                </span>
                <span className="text-muted flex items-center justify-between gap-3 text-xs">
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
  const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
      <div
        aria-label={copy.controls.language}
        className="border-line bg-panel grid grid-cols-3 gap-1 rounded-md border p-1"
        role="group"
      >
        {(["zh", "ja", "en"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onLocaleChange(item)}
            className={`h-8 w-11 rounded text-center font-semibold transition ${
              locale === item
                ? "bg-accent text-white"
                : "text-muted hover:bg-panel-strong hover:text-copy"
            }`}
          >
            {localeLabels[item]}
          </button>
        ))}
      </div>
      <button
        aria-label={`${copy.controls.theme}: ${themeLabels[theme][locale]}`}
        className="border-line bg-panel text-muted hover:border-accent hover:bg-panel-strong hover:text-copy grid h-10 w-10 place-items-center rounded-md border transition"
        title={themeLabels[theme][locale]}
        type="button"
        onClick={() => onThemeChange(nextTheme)}
      >
        <ThemeIcon theme={theme} />
      </button>
    </div>
  );
}

function ThemeIcon({ theme }: { theme: ThemeMode }) {
  if (theme === "light") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.25"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
      </svg>
    );
  }

  return (
    <span aria-hidden="true" className="text-2xl leading-none font-bold">
      ☾
    </span>
  );
}

function CountBadge({
  count,
  copy,
}: {
  count: number;
  copy: (typeof copies)[Locale];
}) {
  return (
    <span className="border-line bg-panel-strong text-muted inline-flex h-9 shrink-0 items-center rounded-full border px-3 text-xs font-semibold whitespace-nowrap">
      <span>{count}</span>
      {copy.sidePanel.countUnit ? (
        <span className="ml-1.5">{copy.sidePanel.countUnit}</span>
      ) : null}
    </span>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line bg-panel rounded-md border px-3 py-2">
      <div className="text-muted text-xs font-medium">{label}</div>
      <div className="text-copy mt-0.5 text-base font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: RailStatus;
  label?: string;
}) {
  return (
    <span className={`status-badge status-badge-${status}`}>
      {label ?? statusCopies.zh[status].label}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted text-xs font-semibold tracking-[0.12em] uppercase">
        {label}
      </dt>
      <dd className="text-copy mt-1 leading-6">{value}</dd>
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
  const validUntil =
    "dct:valid" in raw && raw["dct:valid"]
      ? `${copy.sidePanel.validUntil} ${formatDateTime(raw["dct:valid"], copy)}`
      : null;

  return [sourceName, validUntil].filter(Boolean).join(" / ");
}

function CoverageNote({ copy }: { copy: (typeof copies)[Locale] }) {
  return (
    <p className="text-muted mt-1 text-xs leading-5">
      {copy.sidePanel.sourceNote}{" "}
      <a
        className="text-accent font-semibold underline-offset-2 hover:underline"
        href="https://www.odpt.org/"
        rel="noreferrer"
        target="_blank"
      >
        {copy.sidePanel.sourceReference}
      </a>{" "}
      /{" "}
      <a
        className="text-accent font-semibold underline-offset-2 hover:underline"
        href="https://ckan.odpt.org/dataset"
        rel="noreferrer"
        target="_blank"
      >
        {copy.sidePanel.sourceCatalog}
      </a>
    </p>
  );
}
