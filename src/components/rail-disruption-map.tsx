"use client";

import { useEffect, useMemo, useState } from "react";
import { copies, statusCopies, type Locale, type ThemeMode } from "@/lib/i18n";
import { buildDetailModel } from "@/lib/map/detail-model";
import { formatTime } from "@/lib/map/format";
import type { RailwaySnapshot, Selection } from "@/lib/types";
import {
  DetailPanel,
  LineStatusList,
  Metric,
  Toolbar,
} from "./rail-map/panels";
import { RailwayTileOverview } from "./rail-map/railway-tile-overview";
import { panelFrameClassName } from "./rail-map/styles";

const REFRESH_INTERVAL_MS = 60_000;

type RailDisruptionMapProps = {
  initialSnapshot: RailwaySnapshot;
};

export function RailDisruptionMap({ initialSnapshot }: RailDisruptionMapProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [locale, setLocale] = useState<Locale>("ja");
  const [theme, setTheme] = useState<ThemeMode>("light");

  const copy = copies[locale];
  const statusText = statusCopies[locale];

  const selectedDetail = useMemo(
    () => buildDetailModel(snapshot, selection, locale),
    [snapshot, selection, locale],
  );

  const abnormalCount = snapshot.lines.filter(
    (line) => line.status !== "normal",
  ).length;

  useEffect(() => {
    let cancelled = false;

    async function loadLiveSnapshot() {
      try {
        const response = await fetch("/api/railway-snapshot", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Snapshot request failed: ${response.status}`);
        }

        const nextSnapshot = (await response.json()) as RailwaySnapshot;

        if (!cancelled) {
          setSnapshot(nextSnapshot);
        }
      } catch (error) {
        console.warn(error);
      }
    }

    void loadLiveSnapshot();
    const intervalId = window.setInterval(
      loadLiveSnapshot,
      REFRESH_INTERVAL_MS,
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const selectLine = (lineId: string) => {
    setSelection({ type: "line", lineId });
  };

  return (
    <div
      className="bg-page text-copy min-h-screen"
      data-theme={theme}
      lang={copy.htmlLang}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="border-line flex flex-col gap-4 border-b pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-accent text-xs font-semibold tracking-[0.18em] uppercase">
              {copy.eyebrow}
            </p>
            <h1 className="text-copy mt-1 text-3xl font-semibold tracking-normal md:text-4xl">
              {copy.title}
            </h1>
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
                  snapshot.operation.incidents[0]?.updatedAt ??
                    snapshot.generatedAt,
                  locale,
                  copy.noTime,
                )}
              />
            </div>
          </div>
        </header>

        <section className="grid items-start gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div
            className={`${panelFrameClassName} flex flex-col overflow-hidden`}
          >
            <div className="border-line bg-panel-strong flex flex-col gap-3 border-b p-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h2 className="text-copy text-base font-semibold">
                  {copy.map.title}
                </h2>
                <p className="text-muted mt-1 text-xs">
                  {copy.map.description}
                </p>
              </div>
            </div>

            <div className="bg-map">
              <RailwayTileOverview
                copy={copy}
                lineGeoIndex={snapshot.lineGeoIndex}
                selectedDetail={selectedDetail}
              />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <LineStatusList
              title={copy.abnormalLines}
              lines={snapshot.lines}
              copy={copy}
              locale={locale}
              statusText={statusText}
              onSelectLine={selectLine}
            />
            {selectedDetail ? (
              <DetailPanel
                detail={selectedDetail}
                copy={copy}
                statusText={statusText}
              />
            ) : null}
          </aside>
        </section>
      </div>
    </div>
  );
}
