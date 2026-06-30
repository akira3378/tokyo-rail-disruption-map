"use client";

import { useMemo, useState } from "react";
import { getRailwaySnapshot } from "@/lib/data-access";
import {
  statusStrokeClasses,
} from "@/lib/status";
import {
  copies,
  localeLabels,
  scenarioCopies,
  statusCopies,
  themeLabels,
  type Locale,
  type ThemeMode,
} from "@/lib/i18n";
import type {
  DemoScenario,
  Incident,
  LineViewModel,
  RailwaySnapshot,
  RailStatus,
  Selection,
  SegmentViewModel,
  Station,
} from "@/lib/types";

const MAP_WIDTH = 940;
const MAP_HEIGHT = 760;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const DEFAULT_ZOOM = 1;

type RailDisruptionMapProps = {
  initialSnapshot: RailwaySnapshot;
  scenarios: DemoScenario[];
};

type DetailModel = {
  title: string;
  subtitle: string;
  status: RailStatus;
  incident?: Incident;
  affectedArea: string;
};

export function RailDisruptionMap({
  initialSnapshot,
  scenarios,
}: RailDisruptionMapProps) {
  const [scenarioId, setScenarioId] = useState(initialSnapshot.scenario.id);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("zh");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const snapshot = useMemo(() => getRailwaySnapshot(scenarioId), [scenarioId]);
  const copy = copies[locale];
  const statusText = statusCopies[locale];
  const stationById = useMemo(
    () => new Map(snapshot.stations.map((station) => [station.id, station])),
    [snapshot.stations],
  );

  const selectedDetail = useMemo(
    () => buildDetailModel(snapshot, selection, locale),
    [snapshot, selection, locale],
  );

  const abnormalCount = snapshot.lines.filter(
    (line) => line.status !== "normal",
  ).length;

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"
      data-theme={theme}
      lang={copy.htmlLang}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[var(--foreground)] md:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {copy.subtitle}
            </p>
          </div>
          <div className="grid gap-3 md:justify-items-end">
            <Toolbar
              copy={copy}
              locale={locale}
              theme={theme}
              onLocaleChange={setLocale}
              onThemeChange={setTheme}
            />
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <Metric label={copy.metrics.lines} value={String(snapshot.lines.length)} />
            <Metric label={copy.metrics.abnormal} value={String(abnormalCount)} />
            <Metric
              label={copy.metrics.updated}
              value={formatTime(snapshot.scenario.incidents[0]?.updatedAt, locale, copy.noTime)}
            />
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-h-[620px] flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--panel-strong)] p-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  {copy.map.title}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {copy.map.description}
                </p>
              </div>
              <div className="grid gap-2 md:justify-items-end">
                <ScenarioSwitcher
                  label={copy.map.scenario}
                  locale={locale}
                  scenarioId={scenarioId}
                  scenarios={scenarios}
                  onChange={(nextScenarioId) => {
                    setScenarioId(nextScenarioId);
                    setSelection(null);
                  }}
                />
                <ZoomControls
                  copy={copy}
                  zoom={zoom}
                  onZoomChange={setZoom}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[var(--map-bg)]">
              <div
                className="relative"
                style={{
                  width: `${MAP_WIDTH * zoom}px`,
                  height: `${MAP_HEIGHT * zoom}px`,
                }}
              >
                <RailSvg
                  ariaLabel={copy.map.ariaLabel}
                  lines={snapshot.lines}
                  stations={snapshot.stations}
                  stationById={stationById}
                  selection={selection}
                  hoveredSegmentId={hoveredSegmentId}
                  statusText={statusText}
                  zoom={zoom}
                  onSelect={setSelection}
                  onHover={setHoveredSegmentId}
                />
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <DetailPanel
              detail={selectedDetail}
              scenario={snapshot.scenario}
              copy={copy}
              locale={locale}
              statusText={statusText}
            />
            <Legend title={copy.legend} statusText={statusText} />
            <LineStatusList
              title={copy.lines}
              lines={snapshot.lines}
              statusText={statusText}
              onSelect={setSelection}
            />
          </aside>
        </section>
      </div>
    </div>
  );
}

function RailSvg({
  ariaLabel,
  lines,
  stations,
  stationById,
  selection,
  hoveredSegmentId,
  statusText,
  zoom,
  onSelect,
  onHover,
}: {
  ariaLabel: string;
  lines: LineViewModel[];
  stations: Station[];
  stationById: Map<string, Station>;
  selection: Selection | null;
  hoveredSegmentId: string | null;
  statusText: Record<RailStatus, { label: string; description: string }>;
  zoom: number;
  onSelect: (selection: Selection) => void;
  onHover: (segmentId: string | null) => void;
}) {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      className="block"
      style={{
        width: `${MAP_WIDTH}px`,
        height: `${MAP_HEIGHT}px`,
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
      viewBox="0 0 940 760"
    >
      <rect width="940" height="760" fill="var(--map-bg)" />
      <g opacity="0.42">
        {Array.from({ length: 10 }).map((_, index) => (
          <line
            key={`h-${index}`}
            x1="40"
            x2="900"
            y1={80 + index * 65}
            y2={80 + index * 65}
            stroke="var(--map-grid)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 9 }).map((_, index) => (
          <line
            key={`v-${index}`}
            x1={80 + index * 100}
            x2={80 + index * 100}
            y1="50"
            y2="720"
            stroke="var(--map-grid)"
            strokeWidth="1"
          />
        ))}
      </g>

      {lines.map((line) => (
        <g key={line.id}>
          {line.segments.map((segment) => (
            <RailSegment
              key={segment.id}
              line={line}
              segment={segment}
              stationById={stationById}
              selected={
                (selection?.type === "segment" &&
                  selection.segmentId === segment.id) ||
                (selection?.type === "line" && selection.lineId === line.id)
              }
              hovered={hoveredSegmentId === segment.id}
              statusText={statusText}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </g>
      ))}

      {stations.map((station) => (
        <g key={station.id}>
          <circle
            cx={station.x}
            cy={station.y}
            r="5.5"
            fill="var(--station-fill)"
            stroke="var(--station-stroke)"
            strokeWidth="2"
          />
          <text
            x={station.x + 9}
            y={station.y - 9}
            className="select-none fill-[var(--map-label)] text-[12px] font-semibold"
          >
            {station.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function RailSegment({
  line,
  segment,
  stationById,
  selected,
  hovered,
  statusText,
  onSelect,
  onHover,
}: {
  line: LineViewModel;
  segment: SegmentViewModel;
  stationById: Map<string, Station>;
  selected: boolean;
  hovered: boolean;
  statusText: Record<RailStatus, { label: string; description: string }>;
  onSelect: (selection: Selection) => void;
  onHover: (segmentId: string | null) => void;
}) {
  const from = stationById.get(segment.fromStationId);
  const to = stationById.get(segment.toStationId);

  if (!from || !to) {
    return null;
  }

  const isNormal = segment.status === "normal";
  const isDisrupted = !isNormal;
  const strokeClass = isNormal ? "" : statusStrokeClasses[segment.status];
  const segmentLabel = `${line.name}: ${from.name} - ${to.name} / ${
    segment.incident?.title ?? statusText[segment.status].description
  }`;
  const strokeDasharray =
    segment.status === "reduced"
      ? "10 10"
      : segment.status === "unknown"
        ? "3 8"
        : undefined;

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={line.color}
        strokeLinecap="round"
        strokeWidth={selected || hovered ? 15 : 11}
        opacity={isDisrupted ? 0.26 : selected || hovered ? 0.2 : 0}
        pointerEvents="none"
      />
      {isDisrupted ? (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={selected || hovered ? 18 : 15}
          className={`${strokeClass} rail-alert-halo`}
          pointerEvents="none"
        />
      ) : null}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="transparent"
        strokeWidth="26"
        aria-label={segmentLabel}
        className="cursor-pointer"
        onMouseEnter={() => onHover(segment.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() =>
          onSelect({ type: "segment", segmentId: segment.id, lineId: line.id })
        }
      />
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={isNormal ? line.color : undefined}
        strokeLinecap="round"
        strokeWidth={selected ? 12 : hovered ? 10 : isNormal ? 7 : 10}
        strokeDasharray={strokeDasharray}
        aria-hidden="true"
        className={`${strokeClass} cursor-pointer transition-all ${
          isDisrupted ? "rail-alert-blink" : ""
        }`}
        opacity={isNormal ? 0.86 : 1}
        onMouseEnter={() => onHover(segment.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() =>
          onSelect({ type: "segment", segmentId: segment.id, lineId: line.id })
        }
      />
      {segment.status === "suspended" ? (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#ffffff"
          strokeLinecap="round"
          strokeWidth="2.5"
          strokeDasharray="8 8"
          pointerEvents="none"
        />
      ) : null}
    </g>
  );
}

function ScenarioSwitcher({
  label,
  locale,
  scenarioId,
  scenarios,
  onChange,
}: {
  label: string;
  locale?: Locale;
  scenarioId: string;
  scenarios: DemoScenario[];
  onChange: (scenarioId: string) => void;
}) {
  return (
    <label className="flex w-full flex-col gap-1 text-xs font-semibold text-[var(--muted)] md:w-72">
      {label}
      <select
        value={scenarioId}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 text-sm font-medium text-[var(--foreground)] outline-none ring-[var(--accent)] transition focus:ring-2"
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {getScenarioText(scenario, locale ?? "zh").name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ZoomControls({
  copy,
  zoom,
  onZoomChange,
}: {
  copy: typeof copies[Locale];
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className="flex w-full items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--panel)] p-1 text-xs md:w-72"
      aria-label={copy.map.zoomLevel}
    >
      <span className="px-2 font-semibold text-[var(--muted)]">
        {copy.map.zoomLevel}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onZoomChange(clampZoom(zoom - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          className="map-tool-button"
          aria-label={copy.map.zoomOut}
          title={copy.map.zoomOut}
        >
          -
        </button>
        <span className="min-w-12 px-2 text-center font-semibold text-[var(--foreground)]">
          {zoomPercent}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(clampZoom(zoom + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          className="map-tool-button"
          aria-label={copy.map.zoomIn}
          title={copy.map.zoomIn}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(DEFAULT_ZOOM)}
          disabled={zoom === DEFAULT_ZOOM}
          className="map-tool-button min-w-14 px-2"
          aria-label={copy.map.resetZoom}
          title={copy.map.resetZoom}
        >
          {copy.map.resetZoom}
        </button>
      </div>
    </div>
  );
}

function DetailPanel({
  detail,
  scenario,
  copy,
  locale,
  statusText,
}: {
  detail?: DetailModel;
  scenario: DemoScenario;
  copy: typeof copies[Locale];
  locale: Locale;
  statusText: Record<RailStatus, { label: string; description: string }>;
}) {
  const scenarioText = getScenarioText(scenario, locale);

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
        {detail?.subtitle ?? scenarioText.description}
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
          value={copy.detail.dataPolicy}
        />
      </div>
    </section>
  );
}

function Legend({
  title,
  statusText,
}: {
  title: string;
  statusText: Record<RailStatus, { label: string; description: string }>;
}) {
  const statuses: RailStatus[] = [
    "normal",
    "delayed",
    "suspended",
    "reduced",
    "unknown",
  ];

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {statuses.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className={`h-1.5 w-9 rounded-full ${
                status === "normal" ? "bg-slate-400" : ""
              } ${status === "delayed" ? "bg-amber-500" : ""} ${
                status === "suspended" ? "bg-red-500" : ""
              } ${status === "reduced" ? "bg-violet-500" : ""} ${
                status === "unknown" ? "bg-slate-700" : ""
              }`}
            />
            <span className="text-[var(--muted)]">{statusText[status].label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LineStatusList({
  title,
  lines,
  statusText,
  onSelect,
}: {
  title: string;
  lines: LineViewModel[];
  statusText: Record<RailStatus, { label: string; description: string }>;
  onSelect: (selection: Selection) => void;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
      <div className="mt-3 grid gap-2">
        {lines.map((line) => (
          <button
            key={line.id}
            type="button"
            onClick={() => onSelect({ type: "line", lineId: line.id })}
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
              <StatusBadge status={line.status} label={statusText[line.status].label} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status, label }: { status: RailStatus; label?: string }) {
  return (
    <span
      className={`status-badge status-badge-${status}`}
    >
      {label ?? statusCopies.zh[status].label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-[var(--foreground)]">
        {value}
      </div>
    </div>
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

function buildDetailModel(
  snapshot: RailwaySnapshot,
  selection: Selection | null,
  locale: Locale,
): DetailModel | undefined {
  if (!selection) {
    return undefined;
  }

  const statusText = statusCopies[locale];

  if (selection.type === "line") {
    const line = snapshot.lines.find((item) => item.id === selection.lineId);

    if (!line) {
      return undefined;
    }

    return {
      title: line.name,
      subtitle: `${line.operator} / ${statusText[line.status].description}`,
      status: line.status,
      incident: line.incident,
      affectedArea: line.incident?.affectedArea ?? copies[locale].detail.noLineIncident,
    };
  }

  const line = snapshot.lines.find((item) => item.id === selection.lineId);
  const segment = line?.segments.find(
    (item) => item.id === selection.segmentId,
  );

  if (!line || !segment) {
    return undefined;
  }

  const from = snapshot.stations.find(
    (station) => station.id === segment.fromStationId,
  );
  const to = snapshot.stations.find(
    (station) => station.id === segment.toStationId,
  );
  const stationRange = `${from?.name ?? segment.fromStationId}〜${
    to?.name ?? segment.toStationId
  }`;

  return {
    title: `${line.name} ${stationRange}`,
    subtitle: statusText[segment.status].description,
    status: segment.status,
    incident: segment.incident,
    affectedArea: segment.incident?.affectedArea ?? stationRange,
  };
}

function getScenarioText(scenario: DemoScenario, locale: Locale) {
  return scenarioCopies[locale][scenario.id] ?? scenario;
}

function Toolbar({
  copy,
  locale,
  theme,
  onLocaleChange,
  onThemeChange,
}: {
  copy: typeof copies[Locale];
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

function formatTime(value: string | undefined, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(localeToDateLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

function formatDateTime(value: string | undefined, copy: typeof copies[Locale]) {
  if (!value) {
    return copy.detail.emptyUpdatedAt;
  }

  return new Intl.DateTimeFormat(localeToDateLocaleFromHtml(copy.htmlLang), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

function localeToDateLocale(locale: Locale) {
  const locales: Record<Locale, string> = {
    zh: "zh-CN",
    ja: "ja-JP",
    en: "en-US",
  };

  return locales[locale];
}

function localeToDateLocaleFromHtml(htmlLang: string) {
  if (htmlLang === "ja") {
    return "ja-JP";
  }

  if (htmlLang === "zh-CN") {
    return "zh-CN";
  }

  return "en-US";
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}
