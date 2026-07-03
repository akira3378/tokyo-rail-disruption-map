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

const REFRESH_INTERVAL_MS = 60_000;

type RailDisruptionMapProps = {
  initialSnapshot: RailwaySnapshot;
};

export function RailDisruptionMap({
  initialSnapshot,
}: RailDisruptionMapProps) {
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
          <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--panel-strong)] p-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  {copy.map.title}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {copy.map.description}
                </p>
              </div>
            </div>

            <div className="bg-[var(--map-bg)]">
              <RailwayTileOverview
                copy={copy}
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
