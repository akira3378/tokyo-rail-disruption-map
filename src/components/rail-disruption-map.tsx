"use client";

import { useMemo, useState } from "react";
import { getRailwaySnapshot } from "@/lib/data-access";
import {
  statusBadgeClasses,
  statusDescriptions,
  statusLabels,
  statusStrokeClasses,
} from "@/lib/status";
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

  const snapshot = useMemo(() => getRailwaySnapshot(scenarioId), [scenarioId]);
  const stationById = useMemo(
    () => new Map(snapshot.stations.map((station) => [station.id, station])),
    [snapshot.stations],
  );

  const selectedDetail = useMemo(
    () => buildDetailModel(snapshot, selection),
    [snapshot, selection],
  );

  const abnormalCount = snapshot.lines.filter(
    (line) => line.status !== "normal",
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-300 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              Portfolio MVP
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">
              Tokyo Rail Disruption Map
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Simulated operations dashboard with a provider boundary for ODPT
              or GTFS-RT data. No scraping, no live third-party traffic data in
              this MVP.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <Metric label="対象路線" value={String(snapshot.lines.length)} />
            <Metric label="異常路線" value={String(abnormalCount)} />
            <Metric
              label="更新"
              value={formatTime(snapshot.scenario.incidents[0]?.updatedAt)}
            />
          </div>
        </header>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-h-[620px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900">
                  Simplified Network View
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Custom schematic coordinates for demo use only.
                </p>
              </div>
              <ScenarioSwitcher
                scenarioId={scenarioId}
                scenarios={scenarios}
                onChange={(nextScenarioId) => {
                  setScenarioId(nextScenarioId);
                  setSelection(null);
                }}
              />
            </div>

            <div className="flex-1 overflow-auto bg-[#fbfbf7]">
              <RailSvg
                lines={snapshot.lines}
                stations={snapshot.stations}
                stationById={stationById}
                selection={selection}
                hoveredSegmentId={hoveredSegmentId}
                onSelect={setSelection}
                onHover={setHoveredSegmentId}
              />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <DetailPanel detail={selectedDetail} scenario={snapshot.scenario} />
            <Legend />
            <LineStatusList lines={snapshot.lines} onSelect={setSelection} />
          </aside>
        </section>
      </div>
    </div>
  );
}

function RailSvg({
  lines,
  stations,
  stationById,
  selection,
  hoveredSegmentId,
  onSelect,
  onHover,
}: {
  lines: LineViewModel[];
  stations: Station[];
  stationById: Map<string, Station>;
  selection: Selection | null;
  hoveredSegmentId: string | null;
  onSelect: (selection: Selection) => void;
  onHover: (segmentId: string | null) => void;
}) {
  return (
    <svg
      role="img"
      aria-label="Simplified Tokyo rail disruption map"
      className="h-full min-h-[620px] w-full min-w-[900px]"
      viewBox="0 0 940 760"
    >
      <rect width="940" height="760" fill="#fbfbf7" />
      <g opacity="0.42">
        {Array.from({ length: 10 }).map((_, index) => (
          <line
            key={`h-${index}`}
            x1="40"
            x2="900"
            y1={80 + index * 65}
            y2={80 + index * 65}
            stroke="#dfe5e4"
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
            stroke="#dfe5e4"
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
            fill="#ffffff"
            stroke="#1f2937"
            strokeWidth="2"
          />
          <text
            x={station.x + 9}
            y={station.y - 9}
            className="select-none fill-slate-800 text-[12px] font-semibold"
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
  onSelect,
  onHover,
}: {
  line: LineViewModel;
  segment: SegmentViewModel;
  stationById: Map<string, Station>;
  selected: boolean;
  hovered: boolean;
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
      <title>
        {line.name}: {from.name} - {to.name} /{" "}
        {segment.incident?.title ?? statusDescriptions[segment.status]}
      </title>
    </g>
  );
}

function ScenarioSwitcher({
  scenarioId,
  scenarios,
  onChange,
}: {
  scenarioId: string;
  scenarios: DemoScenario[];
  onChange: (scenarioId: string) => void;
}) {
  return (
    <label className="flex w-full flex-col gap-1 text-xs font-semibold text-slate-600 md:w-72">
      Demo scenario
      <select
        value={scenarioId}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none ring-teal-600 transition focus:ring-2"
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function DetailPanel({
  detail,
  scenario,
}: {
  detail?: DetailModel;
  scenario: DemoScenario;
}) {
  return (
    <section className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            Detail
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {detail?.title ?? "路線または区間を選択"}
          </h2>
        </div>
        {detail ? <StatusBadge status={detail.status} /> : null}
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {detail?.subtitle ?? scenario.description}
      </p>

      <div className="mt-4 grid gap-3 text-sm">
        <DetailRow
          label="影響範囲"
          value={detail?.affectedArea ?? "選択後に表示"}
        />
        <DetailRow
          label="理由"
          value={detail?.incident?.reason ?? "現在表示できる異常情報はありません。"}
        />
        <DetailRow
          label="更新時刻"
          value={formatDateTime(detail?.incident?.updatedAt)}
        />
        <DetailRow
          label="データ"
          value="Mock scenario data only. Real-time provider boundary is documented for ODPT or GTFS-RT."
        />
      </div>
    </section>
  );
}

function Legend() {
  const statuses: RailStatus[] = [
    "normal",
    "delayed",
    "suspended",
    "reduced",
    "unknown",
  ];

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">Status Legend</h2>
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
            <span className="text-slate-700">{statusLabels[status]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LineStatusList({
  lines,
  onSelect,
}: {
  lines: LineViewModel[];
  onSelect: (selection: Selection) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">Lines</h2>
      <div className="mt-3 grid gap-2">
        {lines.map((line) => (
          <button
            key={line.id}
            type="button"
            onClick={() => onSelect({ type: "line", lineId: line.id })}
            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-teal-500 hover:bg-white"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-950">
                {line.name}
              </span>
              <span className="block text-xs text-slate-500">
                {line.operator}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: line.color }}
                aria-hidden="true"
              />
              <StatusBadge status={line.status} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: RailStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-300 bg-white px-3 py-2">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-slate-950">
        {value}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 leading-6 text-slate-800">{value}</dd>
    </div>
  );
}

function buildDetailModel(
  snapshot: RailwaySnapshot,
  selection: Selection | null,
): DetailModel | undefined {
  if (!selection) {
    return undefined;
  }

  if (selection.type === "line") {
    const line = snapshot.lines.find((item) => item.id === selection.lineId);

    if (!line) {
      return undefined;
    }

    return {
      title: line.name,
      subtitle: `${line.operator} / ${statusDescriptions[line.status]}`,
      status: line.status,
      incident: line.incident,
      affectedArea: line.incident?.affectedArea ?? "全線に異常情報なし",
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
    subtitle: statusDescriptions[segment.status],
    status: segment.status,
    incident: segment.incident,
    affectedArea: segment.incident?.affectedArea ?? stationRange,
  };
}

function formatTime(value?: string) {
  if (!value) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) {
    return "異常情報なし";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}
