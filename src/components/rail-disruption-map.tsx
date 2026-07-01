"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getRailwaySnapshot } from "@/lib/data-access";
import { copies, statusCopies, type Locale, type ThemeMode } from "@/lib/i18n";
import {
  DEFAULT_ZOOM,
  FOCUS_PADDING,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "@/lib/map/constants";
import {
  getBoundsZoom,
  getFitZoom,
  getLineBounds,
  getSegmentBounds,
  type MapBounds,
} from "@/lib/map/bounds";
import { buildDetailModel } from "@/lib/map/detail-model";
import { formatTime } from "@/lib/map/format";
import type { PointerEvent } from "react";
import type { DemoScenario, RailwaySnapshot, Selection } from "@/lib/types";
import { RailSvg } from "./rail-map/rail-svg";
import {
  DetailPanel,
  Legend,
  LineStatusList,
  Metric,
  ScenarioSwitcher,
  Toolbar,
  ZoomControls,
} from "./rail-map/panels";

type RailDisruptionMapProps = {
  initialSnapshot: RailwaySnapshot;
  scenarios: DemoScenario[];
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
  const [isPanning, setIsPanning] = useState(false);
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const panStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

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

  useEffect(() => {
    const viewport = mapViewportRef.current;

    if (!viewport) {
      return;
    }

    setZoom(getFitZoom(viewport));
  }, []);

  const focusMapBounds = (bounds: MapBounds) => {
    const viewport = mapViewportRef.current;

    if (!viewport) {
      return;
    }

    const nextZoom = getBoundsZoom(viewport, bounds);
    setZoom(nextZoom);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const left = Math.max(0, (bounds.minX - FOCUS_PADDING) * nextZoom);
        const top = Math.max(0, (bounds.minY - FOCUS_PADDING) * nextZoom);

        viewport.scrollTo({ left, top, behavior: "smooth" });
      });
    });
  };

  const selectLine = (lineId: string) => {
    setSelection({ type: "line", lineId });

    const bounds = getLineBounds(snapshot.lines, stationById, lineId);

    if (bounds) {
      focusMapBounds(bounds);
    }
  };

  const selectSegment = (segmentId: string, lineId: string) => {
    setSelection({ type: "segment", segmentId, lineId });

    const bounds = getSegmentBounds(snapshot.lines, stationById, segmentId, lineId);

    if (bounds) {
      focusMapBounds(bounds);
    }
  };

  const resetMapView = () => {
    const viewport = mapViewportRef.current;

    if (!viewport) {
      setZoom(DEFAULT_ZOOM);
      return;
    }

    const nextZoom = getFitZoom(viewport);
    setZoom(nextZoom);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
      });
    });
  };

  const startMapPan = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const viewport = mapViewportRef.current;

    if (!viewport) {
      return;
    }

    panStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveMapPan = (event: PointerEvent<HTMLDivElement>) => {
    const panState = panStateRef.current;
    const viewport = mapViewportRef.current;

    if (!panState || !viewport || panState.pointerId !== event.pointerId) {
      return;
    }

    viewport.scrollLeft = panState.scrollLeft - (event.clientX - panState.startX);
    viewport.scrollTop = panState.scrollTop - (event.clientY - panState.startY);
    event.preventDefault();
  };

  const endMapPan = (event: PointerEvent<HTMLDivElement>) => {
    if (panStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    panStateRef.current = null;
    setIsPanning(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

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
              <Metric
                label={copy.metrics.lines}
                value={String(snapshot.lines.length)}
              />
              <Metric
                label={copy.metrics.abnormal}
                value={String(abnormalCount)}
              />
              <Metric
                label={copy.metrics.updated}
                value={formatTime(
                  snapshot.scenario.incidents[0]?.updatedAt,
                  locale,
                  copy.noTime,
                )}
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
                  onReset={resetMapView}
                />
              </div>
            </div>

            <div
              ref={mapViewportRef}
              className={`map-pan-viewport flex-1 overflow-auto bg-[var(--map-bg)] ${
                isPanning ? "is-panning" : ""
              }`}
              onPointerDown={startMapPan}
              onPointerMove={moveMapPan}
              onPointerUp={endMapPan}
              onPointerCancel={endMapPan}
              onPointerLeave={endMapPan}
            >
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
                  onSelectSegment={selectSegment}
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
              onSelectLine={selectLine}
            />
          </aside>
        </section>
      </div>
    </div>
  );
}
